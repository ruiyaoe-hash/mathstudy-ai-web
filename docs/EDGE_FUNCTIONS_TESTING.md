# Edge Functions 测试指南

本文档提供Edge Functions的测试和验证步骤。

## 🧪 本地测试

### 前置条件

1. **安装Supabase CLI**
   ```bash
   pnpm add -g supabase
   ```

2. **配置本地Secrets**
   
   创建 `supabase/.env` 文件：
   ```bash
   COZE_API_KEY=your_actual_api_key_here
   COZE_BASE_URL=https://api.coze.com
   COZE_MODEL_BASE_URL=https://model.coze.com
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **启动本地Edge Functions服务器**
   ```bash
   # 方式1：使用项目脚本
   cd supabase
   pnpm run dev

   # 方式2：使用Supabase CLI
   supabase functions serve
   ```

   服务器将运行在 `http://localhost:54321`

### 测试健康检查

```bash
curl http://localhost:54321/functions/v1/ai-service?action=health
```

**期望响应：**
```json
{
  "status": "ok",
  "llm": "enabled",
  "timestamp": "2024-01-21T12:00:00.000Z"
}
```

### 测试AI题目生成

```bash
curl -X POST http://localhost:54321/functions/v1/ai-service \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3,
    "questionType": "选择题"
  }'
```

**期望响应：**
```json
{
  "questions": [
    {
      "id": "unique-id",
      "type": "选择题",
      "question": "题目内容",
      "options": [...],
      "answer": "A",
      "explanation": "详细解析",
      "difficulty": 0.7,
      "knowledgeId": "your-knowledge-id"
    }
  ],
  "metadata": {
    "knowledgeId": "your-knowledge-id",
    "knowledgeName": "知识点名称",
    "grade": 5,
    "questionType": "选择题",
    "generatedAt": "2024-01-21T12:00:00.000Z",
    "aiProvider": "doubao",
    "model": "doubao-seed-1-8-251228"
  }
}
```

### 测试推荐服务

```bash
curl http://localhost:54321/functions/v1/recommendations/user-id-here
```

**期望响应：**
```json
{
  "userId": "user-id-here",
  "recommendations": [
    {
      "id": "knowledge-id",
      "name": "知识点名称",
      "grade": 5,
      "difficulty": 0.5,
      "important": true,
      "priority": 0.85,
      "recommendationReason": "推荐理由",
      "learningStatus": "learning"
    }
  ],
  "generatedAt": "2024-01-21T12:00:00.000Z",
  "totalKnowledgePoints": 50,
  "learnedCount": 10
}
```

## 🚀 生产环境测试

### 部署到生产环境

```bash
# 使用部署脚本
./deploy-edge-functions.sh   # Linux/Mac
deploy-edge-functions.bat     # Windows

# 或使用Supabase CLI
supabase functions deploy ai-service
supabase functions deploy recommendations
```

### 配置生产环境Secrets

1. 访问 Supabase 项目控制台
2. 进入 **Edge Functions** → **Secrets**
3. 添加以下Secrets：

```
COZE_API_KEY=your_actual_api_key_here
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com
```

### 生产环境测试

替换 `your-project-ref` 为你的实际项目引用。

#### 健康检查

```bash
curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health
```

#### AI题目生成（需要认证）

```bash
# 获取JWT Token（从Supabase Auth）
curl -X POST https://your-project-ref.supabase.co/functions/v1/ai-service \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3
  }'
```

#### 推荐服务（需要认证）

```bash
curl https://your-project-ref.supabase.co/functions/v1/recommendations/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🌐 前端集成测试

### 1. 配置前端环境变量

创建或编辑 `.env` 文件：

```env
# 使用Edge Function模式
VITE_API_MODE=edge-function

# Supabase配置
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. 测试前端连接

创建测试页面 `src/pages/TestAI.tsx`：

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkAIServiceHealth, generateAIQuestions, getRecommendations } from '@/services/aiQuestionService';

export default function TestAI() {
  const [status, setStatus] = useState<string>('未测试');
  const [result, setResult] = useState<any>(null);

  const testHealth = async () => {
    setStatus('测试中...');
    const isHealthy = await checkAIServiceHealth();
    setStatus(isHealthy ? '✅ 服务正常' : '❌ 服务异常');
  };

  const testGenerateQuestions = async () => {
    setStatus('测试中...');
    const questions = await generateAIQuestions('test-knowledge-id', 5, 3);
    setResult({ type: 'questions', count: questions.length, data: questions });
    setStatus(`✅ 生成了 ${questions.length} 道题目`);
  };

  const testRecommendations = async () => {
    setStatus('测试中...');
    const userId = 'your-test-user-id';
    const recommendations = await getRecommendations(userId);
    setResult({ type: 'recommendations', count: recommendations.length, data: recommendations });
    setStatus(`✅ 获取了 ${recommendations.length} 个推荐`);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">AI 功能测试</h1>
      
      <div className="space-x-2">
        <Button onClick={testHealth}>测试健康检查</Button>
        <Button onClick={testGenerateQuestions}>测试题目生成</Button>
        <Button onClick={testRecommendations}>测试推荐服务</Button>
      </div>

      <div>
        <strong>状态：</strong> {status}
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

### 3. 运行前端测试

```bash
# 启动前端
pnpm dev

# 访问测试页面
# http://localhost:5000/test-ai
```

## 📊 性能测试

### 响应时间测试

```bash
# 使用time命令测量响应时间
time curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health

# 使用curl的-w选项
curl -w "\nTime: %{time_total}s\n" https://your-project-ref.supabase.co/functions/v1/ai-service?action=health
```

### 并发测试

使用Apache Bench（ab）进行并发测试：

```bash
# 安装ab
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: 已预装

# 并发测试（100个请求，10个并发）
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -p test-data.json -T application/json \
   https://your-project-ref.supabase.co/functions/v1/ai-service
```

创建 `test-data.json`：
```json
{
  "knowledgeId": "test-knowledge-id",
  "grade": 5,
  "count": 3
}
```

## 🐛 故障排查

### 问题1：本地启动失败

**错误：** `Error: Functions directory not found`

**解决：**
```bash
# 确认目录结构
supabase/
├── .env
├── functions/
│   ├── ai-service/
│   │   └── index.ts
│   └── recommendations/
│       └── index.ts

# 在supabase目录下启动
cd supabase
supabase functions serve
```

### 问题2：Secrets未配置

**错误：** `AI服务未配置`

**解决：**
1. 本地：确保 `supabase/.env` 文件存在并包含 `COZE_API_KEY`
2. 生产：在Supabase控制台配置Secrets

### 问题3：CORS错误

**错误：** 浏览器控制台显示CORS错误

**解决：**
Edge Function已配置CORS headers，如果仍有问题：
1. 确认请求携带了正确的Authorization header
2. 检查Supabase项目的CORS设置

### 问题4：AI生成失败

**错误：** 返回 "AI生成失败"

**排查步骤：**
```bash
# 1. 查看Edge Function日志
supabase functions logs ai-service

# 2. 检查豆包API Key是否有效
# 在豆包控制台验证

# 3. 检查API额度
# 在豆包控制台查看使用情况

# 4. 测试知识点ID是否存在
# 在Supabase数据库查询knowledge_nodes表
```

### 问题5：响应超时

**错误：** 请求超时

**解决：**
1. 增加前端超时时间
2. 检查豆包API响应时间
3. 考虑减少生成的题目数量

## 📈 监控和日志

### 查看实时日志

```bash
# 查看所有functions的日志
supabase functions logs

# 查看特定function的日志
supabase functions logs ai-service

# 实时查看日志（follow模式）
supabase functions logs ai-service --follow
```

### 监控面板

访问Supabase项目控制台：
1. **Edge Functions** → 选择function
2. 查看调用统计、错误率、响应时间
3. 查看实时日志和错误详情

### 日志分析

在Edge Function中添加自定义日志：

```typescript
console.log('开始生成题目', { knowledgeId, grade, count });
console.log('AI响应', aiResponse);
console.error('生成失败', error);
```

## ✅ 测试清单

完成以下所有测试项，确保Edge Function正常工作：

### 本地测试

- [ ] Edge Functions服务启动成功
- [ ] 健康检查返回正常
- [ ] AI题目生成成功
- [ ] 推荐服务返回数据
- [ ] 错误处理正常工作

### 生产测试

- [ ] Functions部署成功
- [ ] Secrets配置正确
- [ ] 健康检查返回正常
- [ ] AI题目生成成功（带认证）
- [ ] 推荐服务返回数据（带认证）
- [ ] 响应时间在可接受范围（< 10秒）

### 前端集成测试

- [ ] 前端配置正确（VITE_API_MODE=edge-function）
- [ ] 健康检查成功
- [ ] AI题目生成成功
- [ ] 推荐服务成功
- [ ] UI显示正常
- [ ] 错误处理友好

### 性能测试

- [ ] 单次请求响应时间 < 10秒
- [ ] 并发请求正常
- [ ] 错误率 < 5%

## 🎯 测试通过标准

- ✅ 所有测试项通过
- ✅ 无严重错误
- ✅ 响应时间在可接受范围
- ✅ 错误处理完善
- ✅ 日志记录完整
- ✅ 监控正常工作

## 📝 测试报告模板

```markdown
# Edge Functions 测试报告

**测试日期：** 2024-01-21
**测试人员：** 你的名字
**环境：** 生产环境

## 测试结果

### 功能测试
- [x] 健康检查
- [x] AI题目生成
- [x] 推荐服务

### 性能测试
- 平均响应时间：3.2秒
- 并发测试：通过（100请求/10并发）
- 错误率：0%

### 发现的问题
1. 无

## 结论
✅ 测试通过，可以上线
```

## 相关文档

- [Supabase Edge Functions官方文档](https://supabase.com/docs/guides/functions)
- [迁移指南](SUPABASE_MIGRATION.md)
- [API Key安全管理](API_KEY_SECURITY.md)
