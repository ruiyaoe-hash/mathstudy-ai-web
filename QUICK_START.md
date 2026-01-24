# 🚀 AI功能快速开始指南（小白版）

## 你只需要做这3件事：

### 第1件事：获取 Supabase API 密钥（5分钟）

1. 打开浏览器，访问这个链接：
   ```
   https://supabase.com/dashboard/project/szlkizzsnrjjpibsjizn/settings/api
   ```

2. 找到 **Project URL** 和 **anon public** 这两个值

3. 用文本编辑器打开项目根目录的 `.env` 文件，替换成你的真实值：

   ```env
   VITE_SUPABASE_URL=https://szlkizzsnrjjpibsjizn.supabase.co
   VITE_SUPABASE_ANON_KEY=这里填你的anon密钥（很长的一段字符）
   ```

4. 保存文件

### 第2件事：获取豆包AI API Key（10分钟）

#### 2.1 注册 Coze 平台
1. 访问：https://www.coze.cn
2. 注册并登录（使用手机号或邮箱）

#### 2.2 创建 AI 应用
1. 登录后点击 **"创建应用"**
2. 选择 **"对话型应用"**
3. 名称填写：`planet-education-ai`
4. 点击完成

#### 2.3 获取 API Key
1. 在应用页面，点击右上角的 **...** 按钮
2. 选择 **"API 信息"**
3. 复制 **Personal Access Token (PAT)** - 这就是你的 API Key！

#### 2.4 配置到 Supabase
由于你是小白，我用最简单的方式教你：

**方式1：使用 Supabase 控制台（推荐）**
1. 访问：https://supabase.com/dashboard/project/szlkizzsnrjjpibsjizn/functions/settings
2. 在 "Environment Variables" 区域点击 **"New variable"**
3. 添加：
   - Name: `COZE_API_KEY`
   - Value: 粘贴你刚才复制的 API Key
4. 点击 **Save**

**方式2：本地开发（需要安装 Supabase CLI）**
```bash
# 在项目根目录运行
supabase secrets set COZE_API_KEY=你的API密钥
```

### 第3件事：启动并测试（2分钟）

#### 3.1 启动开发服务器
```bash
cd /workspace/projects/demo1
coze dev
```

等待启动完成后，你会看到类似这样的输出：
```
  VITE v7.3.1  ready in 1234 ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: use --host to expose
```

#### 3.2 测试健康检查
在新的终端窗口运行：
```bash
curl "http://localhost:5000/functions/v1/ai-service?action=health"
```

如果看到这样的输出，说明成功了：
```json
{
  "status": "ok",
  "llm": "enabled",
  "timestamp": "2024-01-21T14:30:00.000Z"
}
```

#### 3.3 打开浏览器测试
1. 访问：http://localhost:5000
2. 注册/登录账户
3. 进入学习页面
4. 选择一个知识点，点击"开始练习"
5. 你应该能看到AI生成的题目！

---

## 常见问题速查

### ❌ 问题1：提示 "AI服务未配置"
**原因**：COZE_API_KEY 没有配置到 Supabase Secrets

**解决**：
1. 重新执行 "第2件事" 的步骤2.4
2. 确认 API Key 没有复制错（不要有多余的空格）

### ❌ 问题2：无法访问 Supabase 控制台
**可能原因**：
- 账号未登录
- 项目ID错误
- 权限问题

**解决**：
1. 确认已登录 Supabase 账号
2. 确认项目ID是：`szlkizzsnrjjpibsjizn`
3. 如果是协作项目，请项目所有者授权

### ❌ 问题3：前端显示"网络错误"
**检查步骤**：
1. 确认 `.env` 文件中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是正确的
2. 打开浏览器的开发者工具（F12），查看 Console 和 Network 标签的错误信息
3. 检查5000端口是否正常启动

### ❌ 问题4：AI生成的题目为空或格式错误
**可能原因**：
- API Key 配额用尽
- 知识点ID不存在
- 模型返回格式异常

**解决**：
1. 检查 Coze 控制台的 API 调用次数
2. 确认数据库中存在对应的知识点数据
3. 查看浏览器控制台的详细错误信息

---

## 下一步

完成以上3件事后，你已经成功接入了AI功能！

现在你可以：
- ✅ 使用AI生成个性化题目
- ✅ 根据学生掌握程度智能推荐
- ✅ 享受企业级的安全保障

**提示**：建议先在小范围测试，确认一切正常后再推广使用。

---

## 需要帮助？

如果遇到问题，可以：
1. 查看详细教程：`SETUP_AI_GUIDE.md`
2. 运行安全检查：`./security-check.sh`（Linux/Mac）或 `security-check.bat`（Windows）
3. 查看 Supabase Edge Functions 日志
4. 检查浏览器控制台的错误信息

祝你成功！🎉
