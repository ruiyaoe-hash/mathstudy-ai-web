# API Key 安全管理指南

## 问题分析

你提出了一个非常好的安全问题：**将API Key直接写入`server/.env`是否有安全风险？**

### 短答案
两种方案都有安全考虑，但**通过Supabase Edge Functions是更安全的方案**。当前的Express方案也安全，但需要严格遵循安全实践。

## 方案对比

### 方案1：当前方案 - Express + .env文件

**安全性：⭐⭐⭐⭐ (4/5)**

#### 优点
- ✅ 简单直接，易于理解和调试
- ✅ 标准做法，大多数项目都采用
- ✅ 灵活性高，不依赖特定平台
- ✅ 开发和本地测试方便

#### 缺点
- ⚠️ 如果`.env`文件被意外提交到git，API Key会泄露
- ⚠️ 服务器被攻破后，`.env`文件可能被读取
- ⚠️ 需要手动管理API Key的轮换
- ⚠️ 多环境（开发、测试、生产）管理需要多个文件

#### 安全措施（必须遵守）

1. **确保.gitignore配置正确**
   ```bash
   # .gitignore 中必须包含
   server/.env
   .env
   .env.local
   ```

2. **提交前检查**
   ```bash
   # 检查是否有敏感信息被提交
   git grep "COZE_API_KEY"
   git log --all --source --full-history -S "your_api_key"
   ```

3. **环境变量注入（生产环境）**
   ```bash
   # Docker方式
   docker run -e COZE_API_KEY=xxx ...
   
   # Vercel/Railway等平台
   # 在平台控制台的Environment Variables中配置
   ```

4. **最小权限原则**
   ```bash
   # 设置文件权限（仅所有者可读）
   chmod 600 server/.env
   ```

### 方案2：推荐方案 - Supabase Edge Functions

**安全性：⭐⭐⭐⭐⭐ (5/5)**

#### 优点
- ✅ **最高安全性**：API Key存储在Supabase云端Secrets
- ✅ **自动加密**：Supabase自动加密存储
- ✅ **访问控制**：只有Edge Functions可以访问Secrets
- ✅ **审计日志**：所有API调用都有日志记录
- ✅ **版本控制**：无需担心Secrets被提交到git
- ✅ **环境隔离**：开发/生产环境自动分离
- ✅ **内置监控**：Supabase提供调用监控和分析

#### 缺点
- ⚠️ 需要学习Supabase Edge Functions
- ⚠️ 调试相对复杂
- ⚠️ 依赖Supabase平台

#### 实现难度：中等

## 推荐方案：Supabase Edge Functions（详细实现）

### 架构对比

**当前架构：**
```
前端(Vite) ──▶ Express服务器 ──▶ 豆包API
                  ▲
                  └─ 读取 .env 中的 API Key
```

**推荐架构：**
```
前端(Vite) ──▶ Supabase Edge Function ──▶ 豆包API
                                    ▲
                                    └─ 读取 Supabase Secrets
```

### 实现步骤

#### 步骤1：创建Supabase Edge Function

```bash
# 安装Supabase CLI
pnpm add -g supabase

# 登录Supabase
supabase login

# 初始化Edge Functions
supabase functions init ai-service
```

#### 步骤2：编写Edge Function代码

创建文件 `supabase/functions/ai-service/index.ts`：

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { LLMClient, Config } from 'https://cdn.jsdelivr.net/npm/coze-coding-dev-sdk@0.7.3/dist/index.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { knowledgeId, grade, count = 6, questionType } = await req.json();

    // 从环境变量获取API Key
    const apiKey = Deno.env.get('COZE_API_KEY');
    if (!apiKey) {
      throw new Error('COZE_API_KEY not configured');
    }

    // 初始化LLM客户端
    const config = new Config({
      apiKey: apiKey,
      baseUrl: Deno.env.get('COZE_BASE_URL') || 'https://api.coze.com',
      modelBaseUrl: Deno.env.get('COZE_MODEL_BASE_URL') || 'https://model.coze.com',
    });
    const llmClient = new LLMClient(config);

    // 获取知识点信息（从Supabase数据库）
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: node } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .eq('id', knowledgeId)
      .single();

    if (!node) {
      throw new Error('知识点不存在');
    }

    // 构建Prompt
    const topic = node.name;
    const prompt = `请为${grade}年级学生生成${count}道关于"${topic}"的数学题目...`;

    // 调用LLM
    const messages = [
      { role: 'system', content: '你是一个专业的数学老师...' },
      { role: 'user', content: prompt }
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    // 解析响应
    const content = response.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { questions: [] };

    return new Response(
      JSON.stringify({
        questions: result.questions || [],
        metadata: {
          knowledgeId,
          knowledgeName: node.name,
          grade: grade || node.grade,
          generatedAt: new Date().toISOString(),
          aiProvider: 'doubao',
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

#### 步骤3：配置Secrets

```bash
# 本地开发（存储在本地）
supabase secrets set COZE_API_KEY=your_api_key_here
supabase secrets set COZE_BASE_URL=https://api.coze.com
supabase secrets set COZE_MODEL_BASE_URL=https://model.coze.com

# 查看Secrets
supabase secrets list

# 部署到生产环境
supabase functions deploy ai-service --project-ref your-project-ref
```

**重要：** 在生产环境，Secrets应该在Supabase控制台配置，而不是命令行！

#### 步骤4：修改前端服务

修改 `src/services/aiQuestionService.ts`：

```typescript
// Supabase Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service`;

export async function generateAIQuestions(
  knowledgeId: string,
  grade: number,
  count: number = 6,
  questionType?: string
): Promise<Question[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        knowledgeId,
        grade,
        count,
        questionType
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('AI题目生成失败:', error);
      return [];
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('生成AI题目失败:', error);
    return [];
  }
}

export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}
```

#### 步骤5：删除Express服务器

使用Edge Functions后，可以删除`server/`目录：

```bash
rm -rf server/
```

## 方案对比总结

| 安全特性 | Express + .env | Supabase Edge Functions |
|---------|----------------|------------------------|
| API Key存储 | 本地文件 | 云端加密Secrets |
| 加密保护 | ❌ 无 | ✅ 自动加密 |
| 访问控制 | ❌ 文件权限 | ✅ Edge Function权限 |
| 版本控制风险 | ⚠️ 需手动管理 | ✅ 完全隔离 |
| 审计日志 | ❌ 需自行实现 | ✅ 内置 |
| 环境隔离 | ⚠️ 需多文件 | ✅ 自动分离 |
| API Key轮换 | ⚠️ 需手动 | ✅ 支持自动 |
| 开发体验 | ✅ 简单 | ⚠️ 需学习 |

## 最佳实践建议

### 如果你选择Express方案

**必须做到：**

1. ✅ 确保`.env`在`.gitignore`中
2. ✅ 生产环境使用环境变量注入（不使用文件）
3. ✅ 定期轮换API Key
4. ✅ 设置严格的文件权限（`chmod 600`）
5. ✅ 使用不同的API Key（开发/测试/生产）
6. ✅ 监控API使用情况，发现异常及时处理

**配置示例：**

```bash
# 开发环境
server/.env.development

# 测试环境
server/.env.test

# 生产环境（使用云平台的环境变量，不创建.env文件）
```

### 如果你选择Supabase方案（推荐）

**优势：**

1. ✅ **最高安全性**：Secrets自动加密存储
2. ✅ **零配置风险**：永远不用担心Secrets被提交到git
3. ✅ **内置监控**：自动记录API调用
4. ✅ **自动扩缩容**：Edge Functions自动扩展
5. ✅ **统一管理**：所有配置在一个平台

**实施建议：**

- 小型项目：当前Express方案足够（严格遵循安全实践）
- 生产环境：强烈推荐Supabase Edge Functions
- 企业项目：必须使用Edge Functions

## 其他安全增强措施

无论选择哪种方案，都应该：

### 1. API Key轮换策略
```typescript
// 定期轮换API Key（每月）
// 在Supabase: 更新Secrets并重新部署
// 在Express: 更新环境变量并重启服务
```

### 2. 使用率限制
```typescript
// 防止滥用
const usageLimit = 1000; // 每天限制1000次调用
const dailyUsage = await getDailyUsage(userId);
if (dailyUsage >= usageLimit) {
  throw new Error('今日AI调用次数已用完');
}
```

### 3. 成本监控
```typescript
// 监控成本，防止超支
const monthlyCost = await getMonthlyCost();
if (monthlyCost > budget) {
  sendAlert('AI成本即将超支');
  disableAIService();
}
```

### 4. 日志审计
```typescript
// 记录所有API调用
logAPICall({
  userId,
  knowledgeId,
  timestamp: new Date(),
  tokensUsed,
  cost
});
```

## 我的建议

### 对于你的项目（星球主题教育游戏）

**短期方案（1-2个月）：**
- ✅ 保持当前Express方案
- ✅ 严格遵守安全实践（.gitignore、环境变量注入等）
- ✅ 使用豆包免费额度测试和验证功能

**长期方案（生产环境）：**
- ✅ 迁移到Supabase Edge Functions
- ✅ 获得最高的安全性
- ✅ 利用Supabase的监控和分析能力

### 迁移时间线

**Week 1-2：** 使用Express方案快速验证功能
- 验证AI生成效果
- 收集用户反馈
- 测试系统稳定性

**Week 3-4：** 迁移到Edge Functions
- 创建Edge Function
- 配置Secrets
- 修改前端调用
- 全面测试

**Week 5+：** 生产环境
- 部署到生产环境
- 监控使用情况
- 根据反馈优化

## 总结

**回答你的问题：**

1. **有安全风险吗？** 
   - 有，但如果严格遵循安全实践，风险可控
   - 必须确保.env不在git中
   - 生产环境不要使用.env文件

2. **应该用Supabase吗？**
   - ✅ **是的，强烈推荐**
   - 提供更高的安全性
   - 更适合生产环境
   - 但需要一定的学习成本

**我的最终建议：**

如果你只是快速原型开发，当前Express方案完全够用。但如果要部署到生产环境，建议迁移到Supabase Edge Functions，这样更安全、更专业。

需要我帮你实现Supabase Edge Functions版本吗？
