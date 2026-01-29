import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';

// 加载环境变量
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// 智谱AI客户端封装
class ZhiPuAIClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'glm-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  // 与Coze SDK兼容的invoke方法
  async invoke(messages: any[], options: any = {}) {
    try {
      console.log('智谱AI API调用开始，messages:', JSON.stringify(messages));
      console.log('智谱AI API Key:', this.apiKey ? '已设置' : '未设置');
      console.log('智谱AI Model:', this.model);
      
      // 使用正确的智谱AI API URL
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      console.log('智谱AI API调用URL:', apiUrl);
      
      // 使用直接的HTTP请求调用智谱AI API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
          stream: false
        })
      });

      console.log('智谱AI API响应状态:', response.status, response.statusText);
      console.log('智谱AI API响应头:', JSON.stringify(Object.fromEntries(response.headers.entries())));
      
      // 读取响应体一次
      const responseText = await response.text();
      console.log('智谱AI API响应文本:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log('智谱AI API响应数据:', JSON.stringify(data));
        
        if (!response.ok) {
          console.error('智谱AI API错误:', data.error);
          throw new Error(`智谱AI API调用失败: ${response.status} ${response.statusText} ${data.error?.message || ''}`);
        }
        
        // 处理标准OpenAI格式响应
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return {
            content: data.choices[0].message.content,
            id: data.id,
            model: data.model,
            usage: data.usage
          };
        } else {
          throw new Error('智谱AI API响应格式错误: 缺少choices字段');
        }
      } catch (jsonError) {
        console.error('智谱AI API响应解析错误:', jsonError);
        throw new Error(`智谱AI API响应解析失败: ${jsonError.message}`);
      }
    } catch (error) {
      console.error('智谱AI调用失败:', error);
      throw error;
    }
  }
}

// 本地模拟AI服务（作为fallback）
class LocalAIService {
  // 模拟题目生成
  generateQuestions(knowledgeId: string, grade: number, count: number, topic: string) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: `local_q${i}`,
        type: '选择题',
        question: `关于${topic}的第${i}道题目`,
        options: [
          { id: 'A', text: '选项A' },
          { id: 'B', text: '选项B' },
          { id: 'C', text: '选项C' },
          { id: 'D', text: '选项D' }
        ],
        answer: 'A',
        explanation: `这是关于${topic}的详细解析`,
        difficulty: 0.5,
        knowledgeId
      });
    }
    return questions;
  }

  // 模拟解题辅导
  solveQuestion(question: string, grade: number) {
    return {
      steps: [
        {
          step: 1,
          description: '理解题目',
          expression: '',
          explanation: '首先仔细阅读题目，理解题意'
        },
        {
          step: 2,
          description: '分析问题',
          expression: '',
          explanation: '分析题目中的已知条件和要求'
        },
        {
          step: 3,
          description: '解决问题',
          expression: '',
          explanation: '根据所学知识解决问题'
        },
        {
          step: 4,
          description: '验证答案',
          expression: '',
          explanation: '检查答案是否正确'
        }
      ],
      finalAnswer: '根据题目计算得出的答案',
      teachingHint: '建议多做类似题目练习'
    };
  }

  // 模拟错误分析
  analyzeMistake(question: string, wrongAnswer: string, correctAnswer: string) {
    return {
      errorAnalysis: '学生可能对知识点理解不透彻',
      correctSolution: '正确的解题思路',
      learningAdvice: '建议加强相关知识点的学习',
      difficulty: '中等'
    };
  }

  // 模拟AI聊天
  chat(message: string, grade: number) {
    return {
      response: `这是对"${message}"的回答。由于网络原因，当前使用本地模拟AI服务。\n\n建议：\n1. 检查网络连接\n2. 确认可以访问model.coze.com\n3. 如果问题持续，请联系管理员`,
      conversationId: `conv_${Date.now()}`,
      aiProvider: 'local',
      model: 'local-simulator',
      confidence: 0.8,
      generatedAt: new Date().toISOString()
    };
  }

  // 模拟概念解释
  explainConcept(concept: string, grade: number) {
    return {
      explanation: `这是对"${concept}"概念的解释。由于网络原因，当前使用本地模拟AI服务。`,
      examples: [`${concept}的例子1`, `${concept}的例子2`],
      applications: `${concept}的应用场景`,
      relatedConcepts: `与${concept}相关的概念`,
      difficulty: '中等',
      aiProvider: 'local',
      model: 'local-simulator',
      generatedAt: new Date().toISOString()
    };
  }

  // 模拟学习建议
  getLearningTips(grade: number, subject: string) {
    return {
      tips: [
        {
          id: '1',
          title: '保持学习兴趣',
          content: '找到学习中的乐趣，让学习变得更加愉快',
          importance: '5',
          applicableSituation: '日常学习'
        },
        {
          id: '2',
          title: '制定学习计划',
          content: '合理安排学习时间，制定可行的学习计划',
          importance: '4',
          applicableSituation: '学期规划'
        },
        {
          id: '3',
          title: '多做练习',
          content: '通过练习巩固所学知识',
          importance: '5',
          applicableSituation: '课后复习'
        }
      ],
      grade,
      subject,
      aiProvider: 'local',
      model: 'local-simulator',
      generatedAt: new Date().toISOString()
    };
  }
}

// 创建本地AI服务实例
const localAIService = new LocalAIService();

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
let llmClient: any = null;

try {
  const apiKey = process.env.ZHIPU_API_KEY;
  const model = process.env.ZHIPU_MODEL || 'glm-4';
  
  if (apiKey) {
    llmClient = new ZhiPuAIClient(apiKey, model);
    console.log('✅ ZhiPu AI Client 初始化成功');
  } else {
    console.warn('⚠️  智谱AI API Key未配置');
  }
} catch (error) {
  console.error('❌ ZhiPu AI Client 初始化失败:', error);
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

    try {
      // 尝试使用Coze API
      if (llmClient) {
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
          model: process.env.ZHIPU_MODEL || 'glm-4',
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
          // 如果解析失败，使用本地模拟服务
          console.warn('Coze API响应解析失败，使用本地模拟服务');
          const questions = localAIService.generateQuestions(knowledgeId, targetGrade, count, topic);
          return res.json({
            questions,
            metadata: {
              knowledgeId,
              knowledgeName: node.name,
              grade: targetGrade,
              questionType: questionType || '选择题',
              generatedAt: new Date().toISOString(),
              aiProvider: 'local',
              model: 'local-simulator',
              warning: 'Coze API响应解析失败，使用本地模拟服务'
            }
          });
        }

        return res.json({
          questions: result.questions || [],
          metadata: {
            knowledgeId,
            knowledgeName: node.name,
            grade: targetGrade,
            questionType: questionType || '选择题',
            generatedAt: new Date().toISOString(),
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4'
          }
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const questions = localAIService.generateQuestions(knowledgeId, targetGrade, count, topic);
        return res.json({
          questions,
          metadata: {
            knowledgeId,
            knowledgeName: node.name,
            grade: targetGrade,
            questionType: questionType || '选择题',
            generatedAt: new Date().toISOString(),
            aiProvider: 'local',
            model: 'local-simulator',
            warning: '智谱AI API未初始化，使用本地模拟服务'
          }
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const questions = localAIService.generateQuestions(knowledgeId, targetGrade, count, topic);
      return res.json({
        questions,
        metadata: {
          knowledgeId,
          knowledgeName: node.name,
          grade: targetGrade,
          questionType: questionType || '选择题',
          generatedAt: new Date().toISOString(),
          aiProvider: 'local',
          model: 'local-simulator',
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        }
      });
    }

  } catch (error) {
    console.error('生成题目失败:', error);
    res.status(500).json({
      error: '生成题目失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 学习路径推荐接口
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
        recommendationReason: getRecommendationReason(mastery, node),
        learningStatus: getLearningStatus(mastery)
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5); // 取前5个

    res.json({
      userId,
      recommendations,
      generatedAt: new Date().toISOString(),
      totalKnowledgePoints: nodes?.length || 0,
      learnedCount: progress?.length || 0
    });

  } catch (error) {
    console.error('生成推荐失败:', error);
    res.status(500).json({
      error: '生成推荐失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 学习路径接口
app.get('/api/ai/learning-path', async (req, res) => {
  try {
    const { userId, grade } = req.query;

    if (!userId) {
      return res.status(400).json({ error: '缺少 userId 参数' });
    }

    // 获取用户学习记录
    const { data: progress } = await supabase
      .from('user_progress')
      .select('knowledge_id, mastery_level, last_practiced_at')
      .eq('user_id', userId);

    // 获取指定年级的知识点
    const query = supabase
      .from('knowledge_nodes')
      .select('*');

    if (grade) {
      query.eq('grade', grade);
    }

    const { data: nodes } = await query.order('grade', 'order');

    // 构建学习路径
    const learningPath = (nodes || []).map(node => {
      const nodeProgress = progress?.find(p => p.knowledge_id === node.id);
      const mastery = nodeProgress?.mastery_level || 0;

      return {
        id: node.id,
        name: node.name,
        grade: node.grade,
        difficulty: node.difficulty,
        important: node.important || false,
        prerequisites: node.prerequisites || [],
        masteryLevel: mastery,
        learningStatus: getLearningStatus(mastery),
        estimatedTime: Math.ceil(node.difficulty * 30) // 估计学习时间（分钟）
      };
    });

    // 按年级和难度排序
    learningPath.sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }
      return a.difficulty - b.difficulty;
    });

    res.json({
      userId,
      learningPath,
      generatedAt: new Date().toISOString(),
      grade: grade || 'all',
      totalSteps: learningPath.length,
      completedSteps: learningPath.filter(p => p.masteryLevel >= 0.8).length
    });

  } catch (error) {
    console.error('生成学习路径失败:', error);
    res.status(500).json({
      error: '生成学习路径失败',
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

function getLearningStatus(mastery: number): string {
  if (mastery === 0) {
    return '未开始';
  } else if (mastery < 0.3) {
    return '开始学习';
  } else if (mastery < 0.6) {
    return '学习中';
  } else if (mastery < 0.8) {
    return '接近掌握';
  } else {
    return '已掌握';
  }
}

// 实时解题辅导接口
app.post('/api/ai/solve-question', async (req, res) => {
  try {
    const { question, knowledgeId, grade } = req.body;

    if (!question) {
      return res.status(400).json({ error: '缺少 question 参数' });
    }

    const targetGrade = grade || 5;

    try {
      // 尝试使用Coze API
      if (llmClient) {
        // 构建Prompt
        const prompt = `请为学生提供关于以下数学题目的详细解题指导：

题目：${question}

要求：
1. 提供步骤式的解题过程
2. 每一步都要有详细的解释
3. 适合${targetGrade}年级学生的理解水平
4. 如果有多种解法，请提供最适合学生的一种
5. 最后提供一个总结，帮助学生理解解题思路

返回格式：
{
  "steps": [
    {
      "step": 1,
      "description": "步骤描述",
      "expression": "数学表达式",
      "explanation": "详细解释"
    }
  ],
  "finalAnswer": "最终答案",
  "teachingHint": "教学提示"
}`;

        // 调用LLM
        const messages = [
          { role: 'system', content: '你是一个专业的数学老师，擅长为学生提供详细的解题指导。' },
          { role: 'user', content: prompt }
        ];

        const response = await llmClient.invoke(messages, {
          model: process.env.ZHIPU_MODEL || 'glm-4',
          temperature: 0.7,
        });

        // 解析响应
        let result;
        try {
          const content = response.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('无法解析JSON');
          }
        } catch (parseError) {
          // 如果解析失败，使用本地模拟服务
          console.warn('Coze API响应解析失败，使用本地模拟服务');
          const solution = localAIService.solveQuestion(question, targetGrade);
          return res.json({
            ...solution,
            metadata: {
              generatedAt: new Date().toISOString(),
              aiProvider: 'local',
              model: 'local-simulator',
              warning: 'Coze API响应解析失败，使用本地模拟服务'
            }
          });
        }

        return res.json({
          steps: result.steps || [],
          finalAnswer: result.finalAnswer || '',
          teachingHint: result.teachingHint || '',
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4'
          }
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const solution = localAIService.solveQuestion(question, targetGrade);
        return res.json({
          ...solution,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'local',
            model: 'local-simulator',
            warning: '智谱AI API未初始化，使用本地模拟服务'
          }
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const solution = localAIService.solveQuestion(question, targetGrade);
      return res.json({
        ...solution,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiProvider: 'local',
          model: 'local-simulator',
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        }
      });
    }

  } catch (error) {
    console.error('解题辅导失败:', error);
    res.status(500).json({
      error: '解题辅导失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 错误分析接口
app.post('/api/ai/analyze-mistake', async (req, res) => {
  try {
    const { question, wrongAnswer, correctAnswer, knowledgeId, grade } = req.body;

    if (!question || !wrongAnswer || !correctAnswer) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const targetGrade = grade || 5;

    try {
      // 尝试使用Coze API
      if (llmClient) {
        // 构建Prompt
        const prompt = `请分析学生在以下数学题目中的错误：

题目：${question}

学生答案：${wrongAnswer}
正确答案：${correctAnswer}

要求：
1. 分析学生可能的错误原因
2. 提供正确的解题思路
3. 给出针对性的学习建议
4. 适合${targetGrade}年级学生的理解水平

返回格式：
{
  "errorAnalysis": "错误分析",
  "correctSolution": "正确解法",
  "learningAdvice": "学习建议",
  "difficulty": "题目难度"
}`;

        // 调用LLM
        const messages = [
          { role: 'system', content: '你是一个专业的数学老师，擅长分析学生的错误并提供针对性的指导。' },
          { role: 'user', content: prompt }
        ];

        const response = await llmClient.invoke(messages, {
          model: process.env.ZHIPU_MODEL || 'glm-4',
          temperature: 0.7,
        });

        // 解析响应
        let result;
        try {
          const content = response.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('无法解析JSON');
          }
        } catch (parseError) {
          // 如果解析失败，使用本地模拟服务
          console.warn('Coze API响应解析失败，使用本地模拟服务');
          const analysis = localAIService.analyzeMistake(question, wrongAnswer, correctAnswer);
          return res.json({
            ...analysis,
            metadata: {
              generatedAt: new Date().toISOString(),
              aiProvider: 'local',
              model: 'local-simulator',
              warning: 'Coze API响应解析失败，使用本地模拟服务'
            }
          });
        }

        return res.json({
          errorAnalysis: result.errorAnalysis || '',
          correctSolution: result.correctSolution || '',
          learningAdvice: result.learningAdvice || '',
          difficulty: result.difficulty || '中等',
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4'
          }
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const analysis = localAIService.analyzeMistake(question, wrongAnswer, correctAnswer);
        return res.json({
          ...analysis,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiProvider: 'local',
            model: 'local-simulator',
            warning: '智谱AI API未初始化，使用本地模拟服务'
          }
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const analysis = localAIService.analyzeMistake(question, wrongAnswer, correctAnswer);
      return res.json({
        ...analysis,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiProvider: 'local',
          model: 'local-simulator',
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        }
      });
    }

  } catch (error) {
    console.error('错误分析失败:', error);
    res.status(500).json({
      error: '错误分析失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// AI助手对话接口
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, knowledgeId, grade, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: '缺少 message 参数' });
    }

    const targetGrade = grade || 5;

    try {
      // 尝试使用Coze API
      if (llmClient) {
        // 构建系统提示
        const systemPrompt = `你是一个专业的数学AI助手，擅长：
1. 解释数学概念和公式
2. 解答数学问题
3. 提供学习建议
4. 用简单易懂的语言讲解复杂概念
5. 适合${targetGrade}年级学生的理解水平

请保持回答友好、专业，并确保数学知识的准确性。`;

        // 构建用户提示
        let userPrompt = message;
        if (knowledgeId) {
          // 获取知识点信息
          const { data: node } = await supabase
            .from('knowledge_nodes')
            .select('name')
            .eq('id', knowledgeId)
            .single();
          if (node) {
            userPrompt += `\n\n相关知识点：${node.name}`;
          }
        }

        // 调用LLM
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];

        const response = await llmClient.invoke(messages, {
          model: process.env.ZHIPU_MODEL || 'glm-4',
          temperature: 0.7,
        });

        return res.json({
          success: true,
          data: {
            response: response.content || '',
            conversationId: conversationId || `conv_${Date.now()}`,
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4',
            confidence: 0.95,
            generatedAt: new Date().toISOString()
          },
          error: null
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const chatResponse = localAIService.chat(message, targetGrade);
        return res.json({
          success: true,
          data: {
            ...chatResponse,
            warning: '智谱AI API未初始化，使用本地模拟服务'
          },
          error: null
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const chatResponse = localAIService.chat(message, targetGrade);
      return res.json({
        success: true,
        data: {
          ...chatResponse,
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        },
        error: null
      });
    }

  } catch (error) {
    console.error('AI对话失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : '未知错误'
      }
    });
  }
});

// 概念解释接口
app.post('/api/ai/explain-concept', async (req, res) => {
  try {
    const { concept, grade, examples = true } = req.body;

    if (!concept) {
      return res.status(400).json({ error: '缺少 concept 参数' });
    }

    const targetGrade = grade || 5;

    try {
      // 尝试使用Coze API
      if (llmClient) {
        // 构建Prompt
        const prompt = `请为${targetGrade}年级学生解释数学概念"${concept}"。

要求：
1. 用简单易懂的语言解释
2. ${examples ? '提供2-3个具体例子' : ''}
3. 说明该概念的应用场景
4. 与相关概念的联系
5. 适合${targetGrade}年级学生的理解水平

返回格式：
{
  "explanation": "概念解释",
  "examples": ["例子1", "例子2"],
  "applications": "应用场景",
  "relatedConcepts": "相关概念",
  "difficulty": "难度等级"
}`;

        // 调用LLM
        const messages = [
          { role: 'system', content: '你是一个专业的数学老师，擅长用简单易懂的语言解释数学概念。' },
          { role: 'user', content: prompt }
        ];

        const response = await llmClient.invoke(messages, {
          model: process.env.ZHIPU_MODEL || 'glm-4',
          temperature: 0.7,
        });

        // 解析响应
        let result;
        try {
          const content = response.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('无法解析JSON');
          }
        } catch (parseError) {
          // 如果解析失败，使用本地模拟服务
          console.warn('Coze API响应解析失败，使用本地模拟服务');
          const explanation = localAIService.explainConcept(concept, targetGrade);
          return res.json({
            success: true,
            data: {
              ...explanation,
              warning: 'Coze API响应解析失败，使用本地模拟服务'
            },
            error: null
          });
        }

        return res.json({
          success: true,
          data: {
            ...result,
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4',
            generatedAt: new Date().toISOString()
          },
          error: null
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const explanation = localAIService.explainConcept(concept, targetGrade);
        return res.json({
          success: true,
          data: {
            ...explanation,
            warning: '智谱AI API未初始化，使用本地模拟服务'
          },
          error: null
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const explanation = localAIService.explainConcept(concept, targetGrade);
      return res.json({
        success: true,
        data: {
          ...explanation,
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        },
        error: null
      });
    }

  } catch (error) {
    console.error('概念解释失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : '未知错误'
      }
    });
  }
});

// 学习建议接口
app.get('/api/ai/learning-tips', async (req, res) => {
  try {
    const { userId, grade, subject = 'math' } = req.query;

    const targetGrade = grade || 5;

    try {
      // 尝试使用Coze API
      if (llmClient) {
        // 构建Prompt
        const prompt = `请为${targetGrade}年级学生提供${subject === 'math' ? '数学' : '全科'}学习建议。

要求：
1. 提供5-8条具体的学习建议
2. 针对${targetGrade}年级学生的认知水平
3. 包含学习方法、时间管理、复习策略等方面
4. 建议要实用可行
5. 语言要鼓励性和建设性

返回格式：
{
  "tips": [
    {
      "id": "1",
      "title": "建议标题",
      "content": "建议内容",
      "importance": "重要性（1-5）",
      "applicableSituation": "适用场景"
    }
  ],
  "grade": ${targetGrade},
  "subject": "${subject}"
}`;

        // 调用LLM
        const messages = [
          { role: 'system', content: '你是一个专业的教育顾问，擅长为学生提供个性化的学习建议。' },
          { role: 'user', content: prompt }
        ];

        const response = await llmClient.invoke(messages, {
          model: process.env.ZHIPU_MODEL || 'glm-4',
          temperature: 0.7,
        });

        // 解析响应
        let result;
        try {
          const content = response.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('无法解析JSON');
          }
        } catch (parseError) {
          // 如果解析失败，使用本地模拟服务
          console.warn('Coze API响应解析失败，使用本地模拟服务');
          const tips = localAIService.getLearningTips(Number(targetGrade), subject as string);
          return res.json({
            success: true,
            data: {
              ...tips,
              warning: 'Coze API响应解析失败，使用本地模拟服务'
            },
            error: null
          });
        }

        return res.json({
          success: true,
          data: {
            ...result,
            aiProvider: 'zhipu',
            model: process.env.ZHIPU_MODEL || 'glm-4',
            generatedAt: new Date().toISOString()
          },
          error: null
        });
      } else {
        // 智谱AI API未初始化，使用本地模拟服务
        console.warn('智谱AI API未初始化，使用本地模拟服务');
        const tips = localAIService.getLearningTips(Number(targetGrade), subject as string);
        return res.json({
          success: true,
          data: {
            ...tips,
            warning: '智谱AI API未初始化，使用本地模拟服务'
          },
          error: null
        });
      }
    } catch (error) {
      // 智谱AI API调用失败，使用本地模拟服务
      console.error('智谱AI API调用失败，使用本地模拟服务:', error);
      const tips = localAIService.getLearningTips(Number(targetGrade), subject as string);
      return res.json({
        success: true,
        data: {
          ...tips,
          warning: '网络连接失败，使用本地模拟服务。请检查网络连接和智谱AI API访问权限'
        },
        error: null
      });
    }

  } catch (error) {
    console.error('学习建议生成失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : '未知错误'
      }
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务运行在 http://localhost:${PORT}`);
  console.log(`📡 健康检查: http://localhost:${PORT}/health`);
  console.log(`🤖 AI题目生成: http://localhost:${PORT}/api/ai/generate-questions`);
  console.log(`🧠 实时解题辅导: http://localhost:${PORT}/api/ai/solve-question`);
  console.log(`🔍 错误分析: http://localhost:${PORT}/api/ai/analyze-mistake`);
  console.log(`💬 AI对话: http://localhost:${PORT}/api/ai/chat`);
  console.log(`📚 概念解释: http://localhost:${PORT}/api/ai/explain-concept`);
  console.log(`🎯 学习建议: http://localhost:${PORT}/api/ai/learning-tips`);
});
