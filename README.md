# 星球主题教育游戏

## 📦 版本信息

**当前版本**: v1.0.0 - Initial Release
**发布日期**: 2026-01-31
**开发状态**: ✅ 正式发布

基于React 19 + TypeScript + Vite开发的星球主题教育游戏应用，集成了AI大语言模型能力，支持智能题目生成和个性化学习推荐。

## 🎉 1.0.0 版本更新日志

### 新增功能
- ✅ **AI 智能题目生成** - 基于知识点自动生成个性化题目
- ✅ **AI 智能解析** - 提供详细的题目解析和教学提示
- ✅ **AI 个性化推荐** - 根据学习历史智能推荐学习内容
- ✅ **AI 概念解释** - 用简单易懂的语言解释数学概念
- ✅ **AI 错误分析** - 分析学生错误原因并提供改进建议
- ✅ **AI 学习建议** - 根据年级提供个性化的学习建议
- ✅ **混合架构** - Supabase Edge Functions + Express 后端
- ✅ **多AI提供商** - 支持智谱AI和Coze AI

### 技术改进
- ✅ **现代前端架构** - React 19 + TypeScript 5 + Vite 7
- ✅ **响应式设计** - 支持各种设备尺寸
- ✅ **性能优化** - 代码分割和懒加载
- ✅ **安全增强** - API密钥安全管理
- ✅ **错误处理** - 完善的错误处理和用户提示

### 已知限制
- ⚠️ **智谱AI API** - 需要账户充值才能使用完整功能
- ⚠️ **Coze AI API** - 需要配置API密钥
- ⚠️ **Supabase** - 需要配置环境变量
- ⚠️ **开发环境** - 需要Node.js >= 24
- ⚠️ **浏览器兼容性** - 推荐使用Chrome、Firefox、Edge最新版本

## ✨ 特性

### 核心功能
- 🌍 **星球探索** - 可视化知识点学习，支持4-6年级数学知识
- 🎮 **答题游戏** - 多种题型，即时反馈，错题记录
- 🏆 **成就系统** - 激励学习，展示进步
- 📊 **排行榜** - 与同学比拼，激发学习动力
- 📖 **错题本** - 针对性复习，巩固薄弱环节

### AI功能（新增）
- 🤖 **智能题目生成** - 基于知识点自动生成个性化题目
- 🎯 **个性化推荐** - 根据学习历史智能推荐学习内容
- 💡 **智能解析** - 提供详细的题目解析和教学提示
- 🎓 **自适应难度** - 根据学生水平调整题目难度

## 🏗️ 技术栈

### 前端
- **框架**: React 19 + TypeScript 5
- **构建工具**: Vite 7
- **UI组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS 4
- **路由**: React Router 7
- **状态管理**: TanStack Query
- **认证**: Supabase Auth

### 后端
- **框架**: Express + TypeScript
- **AI服务**: coze-coding-dev-sdk
- **大语言模型**: 豆包 (Doubao Seed)
- **数据库**: Supabase (PostgreSQL)

### 开发工具
- **包管理器**: pnpm
- **代码规范**: Airbnb ESLint
- **类型检查**: TypeScript

## 📦 快速开始

### 环境要求
- Node.js >= 24
- pnpm >= 8

### 1. 克隆项目
```bash
git clone <repository-url>
cd demo1
```

### 2. 安装依赖
```bash
# 安装前端依赖
pnpm install

# 安装后端依赖
cd server
pnpm install
cd ..
```

### 3. 配置环境变量

#### 前端配置
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 后端配置
```bash
cp server/.env.example server/.env
```

编辑 `server/.env` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
COZE_API_KEY=your_coze_api_key  # 必填！
COZE_BASE_URL=https://api.coze.com
COZE_MODEL_BASE_URL=https://model.coze.com
PORT=3001
```

**获取API Key:**
1. 访问 https://www.doubao.com/
2. 注册账号并登录
3. 进入控制台 → API管理
4. 创建应用并获取 API Key

**⚠️ 安全提示：**
- **不要将真实的API Key提交到git仓库**
- `server/.env` 文件已在 `.gitignore` 中，不会被提交
- 生产环境建议使用环境变量注入，而不是`.env`文件
- 查看 `docs/API_SECURITY_QUICK.md` 了解更多安全最佳实践
- 运行 `./security-check.sh` 或 `security-check.bat` 检查代码安全

**🔒 API Key 安全方案对比：**
- **当前方案（Express + .env）**：适合快速开发，需严格遵循安全实践
- **推荐方案（Supabase Edge Functions）**：生产环境最高安全，API Key存储在云端
- 详细对比请查看 `docs/API_KEY_SECURITY.md`

### 4. 启动服务

#### 方式1：使用启动脚本（推荐）

**Linux/Mac:**
```bash
./start-ai.sh
```

**Windows:**
```bash
start-ai.bat
```

#### 方式2：手动启动

打开两个终端：

**终端1 - 启动后端:**
```bash
cd server
pnpm dev
```

**终端2 - 启动前端:**
```bash
pnpm dev
```

### 5. 访问应用

- 前端应用: http://localhost:5000
- 后端API: http://localhost:3001/health

## 📖 功能说明

### 用户功能

#### 1. 登录注册
- 支持邮箱密码登录
- 自动登录（Token有效期）
- 密码安全存储（bcrypt哈希）

#### 2. 星球学习
- 选择年级（4-6年级）
- 可视化知识点地图
- 点击星球查看详情
- AI智能推荐学习内容

#### 3. 答题游戏
- 选择知识点开始答题
- 多种题型支持
- 实时反馈对错
- 显示详细解析
- AI生成个性化题目

#### 4. 个人中心
- 查看学习进度
- 查看错题本
- 查看成就徽章
- 查看排行榜

### 管理员功能

访问 `/admin` 需要管理员权限：

#### 1. 数据管理
- 初始化知识图谱数据
- 清空知识图谱
- 查看知识点统计

#### 2. 用户管理
- 查看所有用户
- 管理用户权限
- 查看学习统计

#### 3. 题目管理
- 手动添加题目
- 导入题目数据
- 审核AI生成的题目

### AI功能详解

详细配置和使用说明请查看：[AI配置指南](docs/AI_CONFIG_GUIDE.md)

#### 智能题目生成
- 基于知识点自动生成题目
- 支持多种题型（选择、填空、解答）
- 自动调整难度
- 提供详细解析

#### 个性化推荐
- 分析学习历史
- 计算知识点优先级
- 智能推荐学习路径
- 自适应学习计划

## 🗂️ 项目结构

```
demo1/
├── src/                      # 前端源码
│   ├── components/          # React组件
│   │   ├── ui/             # shadcn/ui组件
│   │   └── ...             # 业务组件
│   ├── pages/              # 页面组件
│   │   ├── Login.tsx       # 登录页
│   │   ├── Home.tsx        # 首页
│   │   ├── Planet.tsx      # 星球学习页
│   │   ├── Game.tsx        # 答题游戏页
│   │   └── ...             # 其他页面
│   ├── services/           # 服务层
│   │   ├── aiQuestionService.ts      # AI题目服务
│   │   ├── questionGenerationService.ts  # 题目生成服务
│   │   ├── knowledgeGraphService.ts     # 知识图谱服务
│   │   └── ...             # 其他服务
│   ├── hooks/              # 自定义Hook
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── router.tsx          # 路由配置
│   └── main.tsx            # 应用入口
├── server/                 # 后端服务
│   ├── server.ts           # Express服务器
│   ├── package.json        # 后端依赖
│   └── .env.example        # 后端环境变量示例
├── supabase/               # Supabase Edge Functions
│   ├── functions/
│   │   ├── ai-service/
│   │   │   └── index.ts    # AI题目生成Edge Function
│   │   └── recommendations/
│   │       └── index.ts    # 智能推荐Edge Function
│   ├── package.json        # Edge Functions依赖
│   └── .env                # 本开发环境变量（不提交）
├── database/               # 数据库
│   └── migrations/         # 数据库迁移文件
├── docs/                   # 文档
│   ├── AI_CONFIG_GUIDE.md          # AI配置指南
│   ├── AI_FEATURES_SUMMARY.md      # AI功能总结
│   ├── AI_IMPLEMENTATION_SUMMARY.md  # AI实现总结
│   ├── AI_USAGE_EXAMPLES.md        # AI使用示例
│   ├── API_KEY_SECURITY.md         # API Key安全管理（详细）
│   ├── API_SECURITY_QUICK.md       # API Key安全快速指南
│   ├── SUPABASE_MIGRATION.md       # Edge Functions迁移指南
│   ├── SUPABASE_MIGRATION_SUMMARY.md  # 迁移完成总结
│   └── EDGE_FUNCTIONS_TESTING.md  # Edge Functions测试指南
├── scripts/                # 工具脚本
├── public/                 # 静态资源
├── .coze                   # Coze配置
├── .env.example            # 前端环境变量示例
├── package.json            # 前端依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.ts      # Tailwind配置
├── start-ai.sh             # 启动脚本(Linux/Mac)
└── start-ai.bat            # 启动脚本(Windows)
```

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/router.tsx` 添加路由
3. 如需权限，使用 `ProtectedRoute` 或 `AdminRoute` 组件

### 添加新API

1. 在 `server/server.ts` 添加Express路由
2. 实现业务逻辑
3. 在 `src/services/` 添加前端服务
4. 使用 `fetch` 调用后端API

### 添加新Edge Function

1. 在 `supabase/functions/` 创建新的function目录
2. 创建 `index.ts` 文件实现逻辑
3. 本地测试：`cd supabase && pnpm run dev`
4. 部署：`supabase functions deploy your-function`

详细指南请查看：[Edge Functions迁移指南](docs/SUPABASE_MIGRATION.md)

### 数据库变更

1. 在 `database/migrations/` 创建新的迁移文件
2. 编写SQL变更脚本
3. 在Supabase执行迁移
4. 更新相关类型定义

## 🧪 测试

### 构建检查
```bash
pnpm build
```

### 类型检查
```bash
npx tsc --noEmit
```

### API测试

**Edge Functions（推荐）：**
```bash
# 健康检查
curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health

# 生成题目
curl -X POST https://your-project-ref.supabase.co/functions/v1/ai-service \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3
  }'

# 智能推荐
curl https://your-project-ref.supabase.co/functions/v1/recommendations/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Express后端（开发模式）：**
```bash
# 健康检查
curl http://localhost:3001/health

# 生成题目
curl -X POST http://localhost:3001/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "your-knowledge-id",
    "grade": 5,
    "count": 3
  }'
```

## 📚 文档

### AI功能
- [AI配置指南](docs/AI_CONFIG_GUIDE.md) - AI功能详细配置说明
- [AI功能总结](docs/AI_FEATURES_SUMMARY.md) - AI系统架构设计
- [AI实现总结](docs/AI_IMPLEMENTATION_SUMMARY.md) - AI功能实现细节
- [AI使用示例](docs/AI_USAGE_EXAMPLES.md) - AI功能使用代码示例

### Edge Functions（推荐）
- [Edge Functions迁移指南](docs/SUPABASE_MIGRATION.md) - 从Express迁移到Edge Functions
- [Edge Functions测试指南](docs/EDGE_FUNCTIONS_TESTING.md) - 测试和验证步骤
- [迁移完成总结](docs/SUPABASE_MIGRATION_SUMMARY.md) - 迁移总结和下一步

### 安全和部署
- [API Key安全管理](docs/API_KEY_SECURITY.md) - API Key安全管理详细指南
- [API Key安全快速指南](docs/API_SECURITY_QUICK.md) - API Key安全快速问答
- [知识图谱数据设置](docs/KNOWLEDGE_DATA_SETUP.md) - 数据初始化指南

## 🐛 故障排查

### Edge Functions（推荐生产环境）

#### Edge Function部署失败
**问题**: `Function not found`
**解决**:
```bash
# 检查目录结构
ls supabase/functions/
# 应该看到：ai-service/ recommendations/

# 重新部署
supabase functions deploy ai-service
```

#### Secrets配置错误
**问题**: 调用时返回 "AI服务未配置"
**解决**:
1. 在Supabase控制台配置Secrets
2. 确认Secret名称完全匹配
3. 查看Edge Function日志：`supabase functions logs ai-service`

#### AI生成失败
**问题**: 返回 "AI生成失败"
**解决**:
1. 检查豆包API Key是否有效
2. 检查API额度是否充足
3. 查看Edge Function日志获取详细错误
4. 确认知识点ID存在于数据库中

### Express后端（开发环境）

#### 后端服务启动失败
**问题**: `LLM Client 初始化失败`
**解决**: 检查 `server/.env` 中 `COZE_API_KEY` 是否正确配置

#### 前端调用API失败
**问题**: `Failed to fetch`
**解决**:
1. 确认后端服务已启动
2. 检查前端 `.env` 中 `VITE_API_BASE_URL` 是否正确
3. 查看浏览器控制台详细错误信息

#### AI生成题目失败
**问题**: 返回空数组
**解决**:
1. 检查知识图谱数据是否已导入
2. 查看后端控制台日志
3. 确认豆包API额度充足

更多问题请查看 [AI配置指南](docs/AI_CONFIG_GUIDE.md#故障排查)

## 🔐 安全说明

- ✅ 使用Supabase Auth进行身份认证
- ✅ 密码使用bcrypt哈希存储
- ✅ Token设置有效期，过期需重新登录
- ✅ 所有页面进行身份验证
- ✅ 管理员页面仅限管理员访问
- ✅ API Key存储在环境变量，不提交到版本控制
- ✅ 前后端分离，敏感操作在后端执行

### 🔒 API Key 安全

**当前方案（Express + .env）**
- ⚠️ **适用场景**：快速开发、测试环境
- ✅ **安全等级**：中等（需严格遵循安全实践）
- 📖 **详细文档**：[API Key安全管理](docs/API_KEY_SECURITY.md)
- 📖 **快速指南**：[API Key安全快速指南](docs/API_SECURITY_QUICK.md)

**推荐方案（Supabase Edge Functions）**
- ✅ **适用场景**：生产环境、企业项目
- ✅ **安全等级**：最高（API Key云端加密存储）
- 📖 **实现指南**：[API Key安全管理](docs/API_KEY_SECURITY.md)

**安全检查工具**
```bash
# Linux/Mac
./security-check.sh

# Windows
security-check.bat
```

**核心安全原则：**
1. 永远不要将真实的API Key提交到git
2. 确保`.gitignore`包含`server/.env`和`.env`
3. 生产环境使用环境变量注入，不使用`.env`文件
4. 定期轮换API Key（建议每月）
5. 监控API使用情况，发现异常立即处理

## 🤝 贡献

欢迎贡献代码、报告问题或提出改进建议！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交Issue。
