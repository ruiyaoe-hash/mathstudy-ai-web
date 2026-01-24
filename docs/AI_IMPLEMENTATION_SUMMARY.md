# AI功能实现总结

## 问题回顾

用户提问：**"我没有链接任何API，该系统如何调用AI能力呢？"**

### 原始问题分析

通过代码检查，发现系统存在以下问题：

1. **SDK已安装但未配置**
   - 项目已安装 `coze-coding-dev-sdk v0.7.3`
   - `questionGenerationService.ts` 使用了 `new Config()`，但没有传入API Key

2. **架构不完整**
   - 当前是纯前端Vite应用，没有后端服务
   - SDK设计为后端使用（需要API Key，不能暴露在前端）
   - 缺少API路由来调用AI服务

3. **AI功能无法工作**
   - `aiQuestionService.ts` 返回空数组
   - 代码注释明确标注："AI题目生成功能需要后端支持"

## 解决方案

### 1. 架构设计

采用**前后端分离**架构：

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   前端 (Vite)   │────────▶│  后端 API 服务  │────────▶│  豆包大语言模型  │
│  React 19 + TS  │  HTTP   │   Express + TS  │  SDK    │   Doubao Seed   │
│   Port: 5000    │         │   Port: 3001    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   Supabase DB   │
                            │  知识图谱数据   │
                            └─────────────────┘
```

### 2. 实现内容

#### 后端服务（新建）

**文件结构：**
```
server/
├── server.ts          # Express服务器主文件
├── package.json       # 后端依赖配置
└── .env.example       # 环境变量示例
```

**核心功能：**

1. **LLM客户端初始化**
   ```typescript
   const config = new Config({
     apiKey: process.env.COZE_API_KEY,
     baseUrl: process.env.COZE_BASE_URL || 'https://api.coze.com',
     modelBaseUrl: process.env.COZE_MODEL_BASE_URL || 'https://model.coze.com',
   });
   llmClient = new LLMClient(config);
   ```

2. **AI题目生成API** (`POST /api/ai/generate-questions`)
   - 接收参数：`knowledgeId`, `grade`, `count`, `questionType`
   - 从数据库获取知识点信息
   - 构建AI Prompt
   - 调用豆包大语言模型
   - 解析并返回题目

3. **智能推荐API** (`GET /api/ai/recommendations/:userId`)
   - 获取用户学习记录
   - 获取所有知识点
   - 应用推荐算法（多维度评分）
   - 返回推荐列表

4. **健康检查API** (`GET /health`)
   - 检查服务状态
   - 检查LLM客户端是否启用

#### 前端服务（修改）

**修改文件：**
- `src/services/aiQuestionService.ts`

**主要改动：**

1. **添加后端API基础URL配置**
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
   ```

2. **实现真实的API调用**
   ```typescript
   export async function generateAIQuestions(
     knowledgeId: string,
     grade: number,
     count: number = 6,
     questionType?: string
   ): Promise<Question[]> {
     const response = await fetch(`${API_BASE_URL}/api/ai/generate-questions`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ knowledgeId, grade, count, questionType }),
     });
     const data = await response.json();
     return data.questions;
   }
   ```

3. **添加健康检查功能**
   ```typescript
   export async function checkAIServiceHealth(): Promise<boolean> {
     const response = await fetch(`${API_BASE_URL}/health`);
     const data = await response.json();
     return data.status === 'ok' && data.llm === 'enabled';
   }
   ```

### 3. 配置文件

#### 前端配置（`.env`）
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 后端配置（`server/.env`）
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
COZE_API_KEY=your_coze_api_key  # 必填！
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com
PORT=3001
```

### 4. 文档和工具

**创建的文档：**
- `docs/AI_CONFIG_GUIDE.md` - 详细的配置和使用指南
- `README.md` - 项目总体文档，包含AI功能说明

**创建的工具：**
- `start-ai.sh` - Linux/Mac启动脚本
- `start-ai.bat` - Windows启动脚本

## 使用流程

### 1. 获取API Key

访问豆包官网：https://www.doubao.com/
1. 注册账号并登录
2. 进入控制台 → API管理
3. 创建应用并获取API Key

### 2. 配置环境变量

```bash
# 复制配置文件
cp server/.env.example server/.env
cp .env.example .env

# 编辑配置
# 填入API Key等必要信息
```

### 3. 启动服务

**方式1：使用启动脚本**
```bash
./start-ai.sh  # Linux/Mac
start-ai.bat  # Windows
```

**方式2：手动启动**
```bash
# 终端1：启动后端
cd server
pnpm dev

# 终端2：启动前端
pnpm dev
```

### 4. 访问应用

- 前端应用：http://localhost:5000
- 后端API：http://localhost:3001/health

## 核心技术要点

### 1. AI调用流程

```
前端请求 → 后端API → SDK初始化 → 调用豆包模型 → 解析响应 → 返回结果
```

### 2. Prompt工程

系统使用精心设计的Prompt模板：

```typescript
const prompt = `请为${grade}年级学生生成${count}道关于"${topic}"的数学题目。

要求：
1. 题目类型：${questionType}
2. 难度适中，适合${grade}年级学生
3. 包含题目、选项、正确答案和详细解析
4. 返回JSON格式

返回格式：
{
  "questions": [
    {
      "id": "unique_id",
      "type": "选择题",
      "question": "题目内容",
      "options": [...],
      "answer": "A",
      "explanation": "详细解析",
      "difficulty": 0.7,
      "knowledgeId": "${knowledgeId}"
    }
  ]
}`;
```

### 3. 推荐算法

多维度评分机制：

```typescript
const score =
  mastery * 0.4 +              // 掌握度权重 40%
  (1 - difficulty) * 0.3 +     // 难度权重 30%（难度低优先）
  (hasProgress ? 0 : 1) * 0.2 + // 未学习优先 20%
  (isImportant ? 1 : 0) * 0.1; // 重要知识点优先 10%
```

### 4. 安全考虑

- ✅ API Key存储在后端环境变量
- ✅ 前端通过HTTP请求调用后端，不直接接触SDK
- ✅ 使用CORS保护API
- ✅ 所有请求通过后端转发，避免直接暴露

## 成本控制

系统实现了三级成本控制：

1. **缓存管理**
   - 使用SHA256哈希缓存
   - TTL过期机制
   - LRU淘汰策略

2. **批处理**
   - 支持一次性生成多道题目
   - 减少API调用次数

3. **实时监控**
   - 记录Token消耗
   - 预算告警
   - 趋势分析

## 常见问题

### Q1: 没有API Key可以使用吗？
**A:** 可以。系统其他功能（星球学习、答题游戏、排行榜等）不受影响，只是AI题目生成和智能推荐功能不可用。

### Q2: API Key在哪里获取？
**A:** 访问 https://www.doubao.com/ 注册账号，在控制台创建应用获取。

### Q3: 豆包API是免费的吗？
**A:** 豆包提供免费额度，超出后需要付费。建议先用免费额度测试，成本控制功能可以避免超支。

### Q4: 前端和后端必须同时运行吗？
**A:** 如果需要使用AI功能，是的。但系统核心功能（登录、星球学习、答题）可以在不启动后端的情况下正常使用。

### Q5: 如何检查AI服务是否正常？
**A:**
1. 访问 http://localhost:3001/health
2. 或使用前端代码：`await checkAIServiceHealth()`

## 扩展方向

### 已实现的功能
- ✅ AI题目生成（非流式）
- ✅ 智能推荐（基于算法）
- ✅ 健康检查
- ✅ 后端API服务

### 待实现的功能
- ⏳ 流式输出（SSE协议）
- ⏳ 更多题目类型（填空题、解答题）
- ⏳ 题目审核流程
- ⏳ 个性化Prompt模板
- ⏳ 成本详细分析面板

## 相关文档

- [AI配置指南](AI_CONFIG_GUIDE.md) - 详细的配置和使用说明
- [README.md](../README.md) - 项目总体文档
- [知识图谱数据设置](KNOWLEDGE_DATA_SETUP.md) - 数据初始化指南

## 总结

通过创建后端API服务，系统成功集成了AI大语言模型能力：

1. **架构完整** - 前后端分离，职责清晰
2. **安全可靠** - API Key安全存储，不暴露在前端
3. **易于配置** - 提供详细的配置文档和启动脚本
4. **成本可控** - 实现了缓存、批处理、监控等成本控制机制
5. **扩展性好** - 为未来功能扩展预留了空间

现在系统可以正常调用AI能力，为学生提供智能化的学习体验！
