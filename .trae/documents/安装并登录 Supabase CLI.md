# 安装并登录 Supabase CLI

## 问题分析
- Supabase CLI 包已通过 `pnpm add -D supabase` 安装到项目中
- 但 `node_modules/supabase` 目录中缺少 `bin` 目录和可执行文件
- 这表明 `postinstall.js` 脚本可能没有成功执行

## 解决方案

### 步骤 1：重新执行 postinstall 脚本
- 进入 `node_modules/supabase` 目录
- 运行 `node scripts/postinstall.js` 来下载并安装二进制文件
- 验证 `bin` 目录是否创建并包含可执行文件

### 步骤 2：验证 Supabase CLI 安装
- 运行 `pnpm exec supabase --version` 验证 CLI 是否可以正常运行
- 检查命令输出是否显示版本信息

### 步骤 3：登录 Supabase 账户
- 运行 `pnpm exec supabase login` 命令
- 按照提示在浏览器中完成登录验证
- 验证登录是否成功

### 步骤 4：测试 Edge Functions 部署功能
- 运行 `pnpm exec supabase functions list` 测试基本功能
- 确认 CLI 可以正常与 Supabase 服务通信

## 预期结果
- Supabase CLI 成功安装并可正常运行
- 成功登录 Supabase 账户
- 能够执行 Edge Functions 相关命令
- 为后续部署 AI 服务 Edge Functions 做好准备