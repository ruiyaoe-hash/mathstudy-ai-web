# 🎯 AI功能接入手把手教程

## 📋 前置条件

在开始之前，你需要准备：
1. ✅ Supabase 账户（免费即可）
2. ✅ 豆包AI API Key（需要先在Coze平台申请）
3. ✅ 基本的命令行操作能力

---

## 第一步：获取 Supabase 配置信息

### 1.1 注册/登录 Supabase
访问：https://supabase.com

### 1.2 创建新项目（如果没有的话）
1. 点击 "New Project"
2. 填写项目信息：
   - Name: `planet-education`
   - Database Password: 设置一个强密码（**请记住这个密码！**）
   - Region: 选择离你最近的区域（推荐 Singapore）
3. 点击 "Create new project"
4. 等待项目创建完成（约2分钟）

### 1.3 获取 API 配置
1. 在项目左侧菜单，点击 **Settings** → **API**
2. 找到以下信息并复制：

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.4 填写配置文件
在项目根目录创建 `.env` 文件：

```bash
cd /workspace/projects/demo1
cp .env.template .env
```

然后用文本编辑器打开 `.env` 文件，填写刚才复制的配置：

```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_MODE=edge-function
```

---

## 第二步：获取豆包AI API Key

### 2.1 注册 Coze 平台
访问：https://www.coze.cn

### 2.2 创建 AI 应用
1. 登录后，点击 "创建应用"
2. 选择 "对话型应用"
3. 设置应用名称，例如 "planet-education-ai"
4. 完成创建

### 2.3 获取 API Key
1. 在应用页面，点击右上角 **...** → **API 信息**
2. 复制 **Personal Access Token (PAT)**
3. **重要**：这个API Key后续会配置到Supabase Secrets中，不要泄露！

---

## 第三步：安装项目依赖

### 3.1 安装依赖
```bash
cd /workspace/projects/demo1
pnpm install
```

### 3.2 验证安装
```bash
pnpm list
```
应该能看到 `coze-coding-dev-sdk` 和 `@supabase/supabase-js` 在列表中。

---

## 第四步：配置 Supabase Secrets

### 4.1 本地开发（使用 Supabase CLI）

如果你有 Supabase CLI，可以这样配置本地 Secrets：

```bash
# 设置 API Key（替换为你的真实 API Key）
supabase secrets set COZE_API_KEY=你的豆包API_KEY

# 验证配置
supabase secrets list
```

### 4.2 生产环境（使用 Supabase 控制台）

**⚠️ 推荐方式**：这是最安全的方式！

1. 访问你的 Supabase 项目控制台
2. 左侧菜单 → **Edge Functions** → **Settings**
3. 在 "Environment Variables" 部分，点击 **New variable**
4. 添加以下变量：

| 名称 | 值 | 说明 |
|------|-----|------|
| `COZE_API_KEY` | 你的豆包API Key | 必填 |
| `SUPABASE_URL` | https://你的项目ID.supabase.co | 自动填充 |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的service_role_key | 自动填充 |

5. 点击 **Save** 保存

---

## 第五步：启动本地开发服务器

### 5.1 检查端口
```bash
# 检查5000端口是否被占用
curl -I http://localhost:5000
```

如果返回 "Connection refused"，说明端口空闲，可以继续。

### 5.2 启动开发服务器
```bash
cd /workspace/projects/demo1
coze dev
```

服务器会自动启动在 http://localhost:5000

---

## 第六步：测试 AI 功能

### 6.1 健康检查

在浏览器或终端访问：
```bash
curl "http://localhost:5000/functions/v1/ai-service?action=health"
```

应该看到类似响应：
```json
{
  "status": "ok",
  "llm": "enabled",
  "timestamp": "2024-01-21T..."
}
```

### 6.2 测试题目生成

使用 curl 测试：
```bash
curl -X POST http://localhost:5000/functions/v1/ai-service \
  -H "Content-Type: application/json" \
  -d '{
    "knowledgeId": "test-knowledge-1",
    "grade": "三年级",
    "count": 3,
    "questionType": "选择题"
  }'
```

应该看到 AI 生成的题目返回。

### 6.3 前端测试

1. 打开浏览器访问 http://localhost:5000
2. 登录系统
3. 进入学习页面
4. 选择一个知识点
5. 点击 "开始练习"，应该能看到AI生成的题目

---

## 第七步：安全检查

运行安全检查脚本，确保没有敏感信息泄露：

```bash
# Linux/Mac
cd /workspace/projects/demo1
chmod +x security-check.sh
./security-check.sh

# Windows
cd /workspace/projects/demo1
security-check.bat
```

应该看到：
```
✅ 安全检查通过
- 未发现敏感信息泄露
- .env 文件已排除
- API Key 已配置到 Secrets
```

---

## 常见问题

### Q1: 提示 "AI服务未配置"
**原因**：COZE_API_KEY 没有正确配置到 Supabase Secrets

**解决**：
1. 检查 Supabase 控制台的 Edge Functions → Settings
2. 确认 COZE_API_KEY 已添加且值正确
3. 如果是本地开发，运行 `supabase secrets list` 查看是否已配置

### Q2: Edge Functions 返回 500 错误
**原因**：可能是代码错误或API调用失败

**解决**：
1. 查看 Edge Functions 日志：
   ```bash
   supabase functions logs ai-service
   ```
2. 检查 API Key 是否有效
3. 确认知识点ID在数据库中存在

### Q3: 前端无法调用 Edge Function
**原因**：CORS 问题或 URL 配置错误

**解决**：
1. 检查 `.env` 文件中的 `VITE_SUPABASE_URL` 是否正确
2. 确认 Edge Function 已部署
3. 检查浏览器控制台的错误信息

---

## 下一步

完成以上步骤后，你就可以：
- ✅ 使用 AI 生成个性化题目
- ✅ 根据学生掌握程度智能推荐
- ✅ 享受高安全等级的 API Key 管理

有问题随时问我！
