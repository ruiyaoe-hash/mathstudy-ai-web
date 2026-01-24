# Supabase Edge Functions 迁移指南

本指南帮助你从Express后端迁移到Supabase Edge Functions，获得最高安全等级。

## 📋 迁移前检查

### 环境要求
- ✅ 已安装Supabase CLI
- ✅ 已有Supabase项目
- ✅ 已有豆包API Key
- ✅ Node.js >= 24
- ✅ pnpm >= 8

### 安装Supabase CLI

```bash
# 使用npm安装
pnpm add -g @supabase/supabase-js

# 或使用官方CLI
npm install -g supabase

# 验证安装
supabase --version
```

## 🚀 迁移步骤

### 步骤1：初始化Edge Functions（如果还没有）

```bash
# 登录Supabase
supabase login

# 初始化项目（如果还没有）
supabase init
```

### 步骤2：配置Secrets（API Key）

#### 方式1：本地开发（存储在本地文件）

创建 `supabase/.env` 文件：
```bash
COZE_API_KEY=your_actual_api_key_here
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**注意：** `supabase/.env` 已经在 `.gitignore` 中，不会被提交到git。

#### 方式2：生产环境（使用Supabase控制台）- 推荐！

1. 访问 Supabase 项目控制台
2. 进入 Edge Functions → Secrets
3. 添加以下Secrets：

```
COZE_API_KEY=your_actual_api_key_here
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com
```

**获取Service Role Key：**
1. 进入 Project Settings → API
2. 复制 `service_role` key（这是一个安全的key，只有服务器端可以使用）

### 步骤3：本地测试Edge Functions

```bash
# 启动本地Edge Functions服务器
pnpm run dev

# 或使用Supabase CLI
supabase functions serve
```

服务器将运行在 `http://localhost:54321`

测试健康检查：
```bash
curl http://localhost:54321/functions/v1/ai-service?action=health
```

### 步骤4：部署到Supabase

```bash
# 部署单个function
pnpm run deploy:ai-service

# 部署所有functions
pnpm run deploy

# 或使用Supabase CLI
supabase functions deploy ai-service --project-ref your-project-ref
supabase functions deploy recommendations --project-ref your-project-ref
```

### 步骤5：修改前端代码

修改 `src/services/aiQuestionService.ts`：

```typescript
import { supabase } from '@/lib/supabase';

// Edge Function URL（自动从Supabase配置获取）
const EDGE_FUNCTION_URL = 'https://your-project-ref.supabase.co/functions/v1/ai-service';

export async function generateAIQuestions(
  knowledgeId: string,
  grade: number,
  count: number = 6,
  questionType?: string
): Promise<Question[]> {
  try {
    // 获取当前用户session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('用户未登录');
      return [];
    }

    const response = await fetch(`${EDGE_FUNCTION_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        // Supabase自动添加，但为了保险可以手动添加
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
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
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${EDGE_FUNCTION_URL}?action=health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      signal: AbortSignal.timeout(3000),
    });
    
    const data = await response.json();
    return data.status === 'ok' && data.llm === 'enabled';
  } catch (error) {
    console.error('AI服务健康检查失败:', error);
    return false;
  }
}

export async function getRecommendations(userId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `https://your-project-ref.supabase.co/functions/v1/recommendations/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('获取推荐失败:', error);
      return [];
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('获取推荐失败:', error);
    return [];
  }
}
```

### 步骤6：更新环境变量

修改 `.env` 文件：

```env
# 移除或注释掉Express后端的URL
# VITE_API_BASE_URL=http://localhost:3001

# Supabase配置（保持不变）
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 添加Edge Function URL
VITE_EDGE_FUNCTION_URL=https://your-project-ref.supabase.co/functions/v1
```

### 步骤7：清理Express后端（可选但推荐）

```bash
# 备份Express代码（以防需要回退）
mv server server.backup

# 或删除
rm -rf server
```

## ✅ 验证部署

### 1. 测试健康检查

```bash
# 本地测试
curl http://localhost:54321/functions/v1/ai-service?action=health

# 生产测试（替换your-project-ref）
curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health
```

期望响应：
```json
{
  "status": "ok",
  "llm": "enabled",
  "timestamp": "2024-01-21T12:00:00.000Z"
}
```

### 2. 测试题目生成

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/ai-service \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3,
    "questionType": "选择题"
  }'
```

### 3. 测试推荐服务

```bash
curl https://your-project-ref.supabase.co/functions/v1/recommendations/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 测试前端功能

1. 启动前端：`pnpm dev`
2. 登录系统
3. 访问星球学习页面
4. 测试AI题目生成功能
5. 测试智能推荐功能

## 🔧 常见问题

### Q1: Edge Function部署失败

**问题：** 部署时报错 "Function not found"

**解决：**
```bash
# 确认目录结构正确
supabase/
└── functions/
    ├── ai-service/
    │   └── index.ts
    └── recommendations/
        └── index.ts

# 重新部署
supabase functions deploy ai-service
```

### Q2: Secrets配置错误

**问题：** 调用时返回 "AI服务未配置"

**解决：**
1. 确认Secrets已在Supabase控制台配置
2. 确认Secret名称完全匹配（区分大小写）
3. 查看Edge Function日志：`supabase functions logs ai-service`

### Q3: CORS错误

**问题：** 浏览器控制台报 CORS 错误

**解决：**
Edge Function已配置CORS headers，如果仍有问题：
1. 确认请求携带了正确的Authorization header
2. 确认Supabase项目允许你的域名

### Q4: AI生成失败

**问题：** 返回 "AI生成失败"

**解决：**
1. 检查豆包API Key是否有效
2. 检查API额度是否充足
3. 查看Edge Function日志获取详细错误
4. 确认知识点ID存在于数据库中

### Q5: 性能问题

**问题：** Edge Function响应慢

**解决：**
1. 豆包API调用需要时间，这是正常的
2. 可以考虑增加缓存机制
3. 查看Supabase监控面板

## 📊 监控和日志

### 查看日志

```bash
# 查看所有functions的日志
pnpm run logs

# 查看特定function的日志
supabase functions logs ai-service

# 实时查看日志
supabase functions logs ai-service --follow
```

### 监控面板

访问 Supabase 项目控制台：
1. Edge Functions → 选择function
2. 查看调用统计、错误率、响应时间
3. 查看实时日志

## 🎯 性能优化建议

### 1. 启用缓存

在Edge Function中添加Redis缓存（可选）：
```typescript
// 缓存AI生成的题目
const cacheKey = `questions:${knowledgeId}:${grade}:${count}`;
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
// ... 生成题目
await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 });
```

### 2. 限制并发

```typescript
// 使用Semaphore限制并发调用
import { Semaphore } from 'https://deno.land/x/semaphore/mod.ts'

const semaphore = new Semaphore(5); // 最多5个并发

await semaphore.acquire();
try {
  // ... 调用AI
} finally {
  semaphore.release();
}
```

### 3. 超时设置

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  // ...
} catch (error) {
  if (error.name === 'AbortError') {
    // 处理超时
  }
}
```

## 🔄 回滚方案

如果需要回滚到Express方案：

```bash
# 1. 恢复Express代码
cp -r server.backup server

# 2. 修改前端代码，恢复使用Express API
# 修改 aiQuestionService.ts 中的 API_BASE_URL

# 3. 启动Express服务
cd server
pnpm dev

# 4. 更新 .env
VITE_API_BASE_URL=http://localhost:3001
```

## 📚 相关文档

- [Supabase Edge Functions官方文档](https://supabase.com/docs/guides/functions)
- [Deno API参考](https://deno.land/manual)
- [AI功能配置指南](AI_CONFIG_GUIDE.md)
- [API Key安全管理](API_KEY_SECURITY.md)

## 🎉 迁移完成

恭喜！你已经成功迁移到Supabase Edge Functions，获得了最高安全等级！

### 迁移后的优势

- ✅ **最高安全性**：API Key云端加密存储
- ✅ **零配置风险**：永远不用担心API Key泄露
- ✅ **自动扩缩容**：Supabase自动处理负载
- ✅ **内置监控**：实时查看调用统计和日志
- ✅ **全球分布**：Edge Function部署在全球CDN
- ✅ **成本优化**：按使用量计费，无闲置成本

### 下一步

1. **监控使用情况** - 在Supabase控制台查看调用统计
2. **优化性能** - 根据日志分析优化调用
3. **添加更多功能** - 基于Edge Functions扩展更多AI功能

有问题请查看文档或提交Issue！
