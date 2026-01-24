import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { createClient } from '@supabase/supabase-js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// LLM 客户端
let llmClient: LLMClient | null = null;

try {
  const config = new Config({
    apiKey: process.env.COZE_API_KEY,
    baseUrl: process.env.COZE_BASE_URL || 'https://api.coze.com',
    modelBaseUrl: process.env.COZE_MODEL_BASE_URL || 'https://model.coze.com',
  });
  llmClient = new LLMClient(config);
  console.log('✅ LLM Client 初始化成功');
} catch (error) {
  console.error('❌ LLM Client 初始化失败:', error);
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    llm: llmClient ? 'enabled' : 'disabled',
    timestamp: new Date().toISOString()
  });
});

// AI题目生成接口（非流式）
app.post('/api/ai/generate-questions', async (req, res) => {
  try {
    const { knowledgeId, grade, count = 6, questionType } = req.body;

    if (!llmClient) {
      return res.status(503).json({
        error: 'AI服务未配置',
        message: '请设置COZE_API_KEY环境变量'
      });
    }

    if (!knowledgeId) {
      return res.status(400).json({ error: '缺少 knowledgeId 参数' });
    }

    // 获取知识点信息
    const { data: node, error } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('id', knowledgeId)
      .single();

    if (error || !node) {
      return res.status(404).json({ error: '知识点不存在' });
    }

    const topic = node.name;
    const targetGrade = grade || node.grade;

    // 构建Prompt
    const prompt = `请为${targetGrade}年级学生生成${count}道关于"${topic}"的数学题目。

要求：
1. 题目类型：${questionType || '选择题'}
2. 难度适中，适合${targetGrade}年级学生
3. 包含题目、选项、正确答案和详细解析
4. 返回JSON格式，包含questions数组

返回格式：
{
  "questions": [
    {
      "id": "unique_id",
      "type": "选择题",
      "question": "题目内容",
      "options": [
        {"id": "A", "text": "选项A"},
        {"id": "B", "text": "选项B"},
        {"id": "C", "text": "选项C"},
        {"id": "D", "text": "选项D"}
      ],
      "answer": "正确选项ID",
      "explanation": "详细解析",
      "difficulty": 0.7,
      "knowledgeId": "${knowledgeId}"
    }
  ]
}`;

    // 调用LLM
    const messages = [
      { role: 'system', content: '你是一个专业的数学老师，擅长生成适合学生的练习题。' },
      { role: 'user', content: prompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    // 解析响应
    let result;
    try {
      // 尝试从响应中提取JSON
      const content = response.content || response.content?.[0]?.text || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析JSON');
      }
    } catch (parseError) {
      // 如果解析失败，返回格式化错误
      return res.json({
        questions: [],
        metadata: {
          knowledgeId,
          knowledgeName: node.name,
          grade: targetGrade,
          generatedAt: new Date().toISOString(),
          error: 'AI响应解析失败'
        }
      });
    }

    res.json({
      questions: result.questions || [],
      metadata: {
        knowledgeId,
        knowledgeName: node.name,
        grade: targetGrade,
        questionType: questionType || '选择题',
        generatedAt: new Date().toISOString(),
        aiProvider: 'doubao',
        model: 'doubao-seed-1-8-251228'
      }
    });

  } catch (error) {
    console.error('生成题目失败:', error);
    res.status(500).json({
      error: '生成题目失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// AI智能推荐接口
app.get('/api/ai/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 获取用户学习记录
    const { data: progress } = await supabase
      .from('user_progress')
      .select('knowledge_id, mastery_level, last_practiced_at')
      .eq('user_id', userId);

    // 获取所有知识点
    const { data: nodes } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .order('grade', 'order');

    // 推荐算法
    const recommendations = (nodes || []).map(node => {
      const nodeProgress = progress?.find(p => p.knowledge_id === node.id);
      const mastery = nodeProgress?.mastery_level || 0;

      // 计算推荐分数
      const score =
        mastery * 0.4 +         // 掌握度权重
        (1 - node.difficulty) * 0.3 +  // 难度权重（难度低优先）
        (nodeProgress ? 0 : 1) * 0.2 +  // 未学习优先
        (node.important ? 1 : 0) * 0.1;  // 重要知识点优先

      return {
        ...node,
        priority: score,
        recommendationReason: getRecommendationReason(mastery, node)
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5); // 取前5个

    res.json({
      userId,
      recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('生成推荐失败:', error);
    res.status(500).json({
      error: '生成推荐失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

function getRecommendationReason(mastery: number, node: any): string {
  if (mastery === 0) {
    return `未学习过"${node.name}"，建议从基础开始`;
  } else if (mastery < 0.5) {
    return `"${node.name}"掌握度较低，建议加强练习`;
  } else if (mastery < 0.8) {
    return `"${node.name}"有进步空间，可提升熟练度`;
  } else {
    return `"${node.name}"掌握较好，可挑战更高难度`;
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务运行在 http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 AI题目生成: http://localhost:${PORT}/api/ai/generate-questions`);
});
