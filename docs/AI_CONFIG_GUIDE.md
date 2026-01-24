# AI功能配置与使用指南

## 概述

本系统集成了AI大语言模型能力，支持智能题目生成和个性化学习推荐。系统采用前后端分离架构，前端通过API调用后端服务，后端使用 coze-coding-dev-sdk 调用豆包大语言模型。

## 架构说明

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   前端 (Vite)   │────────▶│  后端 API 服务  │────────▶│  豆包大语言模型  │
│  React 19 + TS  │  HTTP   │   Express + TS  │  SDK    │   Doubao Seed   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                           │
       ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   Supabase DB   │◀────────│  AI缓存管理     │
│   知识图谱数据  │         │  成本控制       │
└─────────────────┘         └─────────────────┘
```

## 配置步骤

### 1. 后端服务配置

#### 1.1 安装后端依赖

```bash
cd server
pnpm install
```

#### 1.2 配置环境变量

复制 `server/.env.example` 为 `server/.env`，并填入实际配置：

```bash
cp server/.env.example server/.env
```

编辑 `server/.env` 文件：

```env
# Supabase 配置（与前端相同）
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Coze AI 配置（必填！）
COZE_API_KEY=your_coze_api_key_here
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com

# 服务器配置（默认3001端口）
PORT=3001
```

**重要说明：**

- `COZE_API_KEY` 是必填项，需要从豆包平台获取
- 如果没有API Key，AI功能将无法使用，但系统其他功能正常
- 后端服务默认运行在 3001 端口

#### 1.3 获取 Coze API Key

豆包（Doubao）AI 平台提供免费额度，需要注册并获取API Key：

1. 访问豆包官网：https://www.doubao.com/
2. 注册账号并登录
3. 进入控制台 → API管理
4. 创建应用并获取 API Key
5. 将 API Key 填入 `server/.env` 的 `COZE_API_KEY` 字段

#### 1.4 启动后端服务

```bash
cd server
pnpm dev
```

成功启动后会看到：

```
✅ LLM Client 初始化成功
🚀 后端服务运行在 http://localhost:3001
📡 健康检查: http://localhost:3001/health
🤖 AI题目生成: http://localhost:3001/api/ai/generate-questions
```

### 2. 前端配置

#### 2.1 配置环境变量

复制根目录的 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 后端API地址（必须与后端服务地址一致）
VITE_API_BASE_URL=http://localhost:3001

# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 2.2 启动前端服务

```bash
pnpm dev
```

前端服务将运行在 http://localhost:5000

## API 接口说明

### 1. 健康检查

**接口：** `GET /health`

**响应：**

```json
{
  "status": "ok",
  "llm": "enabled",
  "timestamp": "2024-01-21T12:00:00.000Z"
}
```

### 2. AI题目生成

**接口：** `POST /api/ai/generate-questions`

**请求参数：**

```json
{
  "knowledgeId": "uuid-string",
  "grade": 5,
  "count": 6,
  "questionType": "选择题"
}
```

**响应：**

```json
{
  "questions": [
    {
      "id": "unique-id",
      "type": "选择题",
      "question": "题目内容",
      "options": [
        {"id": "A", "text": "选项A"},
        {"id": "B", "text": "选项B"},
        {"id": "C", "text": "选项C"},
        {"id": "D", "text": "选项D"}
      ],
      "answer": "A",
      "explanation": "详细解析",
      "difficulty": 0.7,
      "knowledgeId": "uuid-string"
    }
  ],
  "metadata": {
    "knowledgeId": "uuid-string",
    "knowledgeName": "知识点名称",
    "grade": 5,
    "questionType": "选择题",
    "generatedAt": "2024-01-21T12:00:00.000Z",
    "aiProvider": "doubao",
    "model": "doubao-seed-1-8-251228"
  }
}
```

### 3. 智能推荐

**接口：** `GET /api/ai/recommendations/:userId`

**响应：**

```json
{
  "userId": "uuid-string",
  "recommendations": [
    {
      "id": "uuid-string",
      "name": "知识点名称",
      "grade": 5,
      "difficulty": 0.5,
      "important": true,
      "priority": 0.85,
      "recommendationReason": "推荐理由"
    }
  ],
  "generatedAt": "2024-01-21T12:00:00.000Z"
}
```

## 前端使用示例

### 生成AI题目

```typescript
import { generateAIQuestions, checkAIServiceHealth } from '@/services/aiQuestionService';

// 检查AI服务是否可用
const isAvailable = await checkAIServiceHealth();
if (!isAvailable) {
  console.error('AI服务不可用，请检查后端服务');
  return;
}

// 生成题目
const questions = await generateAIQuestions(
  'knowledge-id-here',  // 知识点ID
  5,                     // 年级
  6,                     // 题目数量
  '选择题'               // 题目类型（可选）
);

console.log('生成的题目:', questions);
```

### 检查AI服务健康状态

```typescript
import { isAIGenerationEnabled } from '@/services/aiQuestionService';

if (isAIGenerationEnabled()) {
  // AI功能已启用
} else {
  // 提示用户配置后端服务
}
```

## 故障排查

### 1. 后端服务启动失败

**问题：** `LLM Client 初始化失败`

**原因：** 缺少 `COZE_API_KEY` 或配置错误

**解决：**
1. 检查 `server/.env` 文件是否存在
2. 确认 `COZE_API_KEY` 已正确填写
3. 重启后端服务

### 2. 前端调用API失败

**问题：** `Failed to fetch` 或 `503 Service Unavailable`

**原因：** 后端服务未启动或地址配置错误

**解决：**
1. 确认后端服务已启动（访问 http://localhost:3001/health）
2. 检查前端 `.env` 中的 `VITE_API_BASE_URL` 是否正确
3. 确认前后端端口未冲突（前端5000，后端3001）

### 3. AI生成题目失败

**问题：** 返回空数组或错误信息

**原因：**
- 知识点不存在
- AI响应解析失败
- API Key 额度不足

**解决：**
1. 检查知识图谱数据是否已导入（访问 /data-management）
2. 查看后端控制台日志
3. 确认豆包API额度充足

### 4. CORS跨域问题

**问题：** 浏览器控制台报 CORS 错误

**原因：** 后端未配置CORS

**解决：** 后端已默认配置CORS，如仍有问题检查 `server.ts:18` 的cors配置

## 成本控制

系统已实现三级成本控制策略：

### 1. 缓存管理
- 使用 SHA256 哈希缓存生成结果
- 设置 TTL 过期时间
- LRU 淘汰策略

### 2. 批处理
- 支持一次性生成多道题目
- 减少API调用次数

### 3. 实时监控
- 记录每次API调用的Token消耗
- 预算告警机制
- 趋势分析

**查看成本：** 后端控制台会输出每次调用的Token消耗

## 注意事项

1. **API Key 安全**
   - 不要将 `COZE_API_KEY` 提交到版本控制
   - 使用环境变量管理敏感信息
   - 生产环境使用服务端密钥

2. **性能优化**
   - 后端服务支持并发请求
   - 建议在低峰时段批量生成题目
   - 合理使用缓存减少API调用

3. **额度管理**
   - 豆包提供免费额度，超出需要付费
   - 定期查看API使用情况
   - 设置预算告警避免超支

4. **数据质量**
   - 知识图谱数据需要提前导入
   - AI生成的题目需要人工审核
   - 定期更新和优化Prompt模板

## 开发与调试

### 开发模式

```bash
# 终端1：启动后端
cd server
pnpm dev

# 终端2：启动前端
pnpm dev
```

### 调试后端

后端日志会输出详细的调用信息：

```
✅ LLM Client 初始化成功
🚀 后端服务运行在 http://localhost:3001
POST /api/ai/generate-questions - 知识点ID: xxx
AI响应解析成功 - 生成6道题目
Token消耗: 1234
```

### 测试API

使用 curl 测试后端服务：

```bash
# 健康检查
curl http://localhost:3001/health

# 生成题目（替换实际参数）
curl -X POST http://localhost:3001/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3
  }'
```

## 下一步优化

1. **流式输出**
   - 实现SSE协议，实时展示生成过程
   - 提升用户体验

2. **题目类型扩展**
   - 支持更多题目类型（填空题、解答题等）
   - 增强题目多样性

3. **个性化推荐**
   - 基于学习历史的智能推荐
   - 自适应难度调整

4. **多语言支持**
   - 支持英文题目生成
   - 国际化能力

5. **题目审核**
   - AI生成题目的人工审核流程
   - 质量保证机制

## 联系与支持

如有问题，请查看：
- 项目文档：`/docs`
- 代码注释：关键函数都有详细注释
- Issue跟踪：提交Issue反馈问题
