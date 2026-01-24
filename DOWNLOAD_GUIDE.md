# 📦 下载项目代码指南

由于系统限制，无法直接提供压缩包下载。以下是获取项目代码的方法：

---

## 🎯 方法1：通过 Git 克隆（推荐）

### 第一步：确保你安装了 Git

**Windows:**
1. 访问：https://git-scm.com/downloads
2. 下载并安装 Git
3. 安装完成后，打开命令提示符（CMD）或 PowerShell

**Mac:**
```bash
# Mac 通常预装了 Git，检查是否安装
git --version

# 如果没有安装，使用 Homebrew 安装
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

---

### 第二步：克隆项目

**在命令行中运行：**

```bash
# 克隆项目到本地
git clone https://github.com/ruiyaoe-hash/demo1.git

# 进入项目目录
cd demo1
```

---

### 第三步：安装依赖

**在项目目录中运行：**

```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 如果没有 pnpm，先安装它
npm install -g pnpm
# 然后再运行
pnpm install
```

---

## 🌐 方法2：通过 GitHub 网站下载

### 第一步：访问项目页面

打开浏览器，访问：
```
https://github.com/ruiyaoe-hash/demo1
```

### 第二步：下载代码

1. 在页面右上角找到绿色的 **"Code"** 按钮
2. 点击它
3. 选择 **"Download ZIP"**
4. 等待下载完成

### 第三步：解压文件

1. 找到下载的 `.zip` 文件
2. 解压到你的工作目录
3. 重命名文件夹为 `demo1`

### 第四步：安装依赖

```bash
cd demo1
pnpm install
```

---

## 📁 项目结构

下载后的项目结构如下：

```
demo1/
├── .env                    # 环境变量配置（需要自己创建）
├── .env.example            # 配置示例
├── .gitignore              # Git 忽略文件
├── package.json            # 项目依赖配置
├── pnpm-lock.yaml          # 依赖锁定文件
├── vite.config.ts          # Vite 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── index.html              # HTML 入口文件
├── src/                    # 源代码目录
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层（API 调用）
│   ├── hooks/             # React Hooks
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── lib/               # 第三方库配置
│   └── main.tsx           # 应用入口
├── supabase/              # Supabase 配置
│   ├── config.toml        # Supabase 项目配置
│   ├── functions/         # Edge Functions
│   ├── migrations/        # 数据库迁移
│   └── package.json       # Supabase 依赖
├── server/                # Express 后端（可选）
├── database/              # 数据库脚本
├── docs/                  # 文档目录
│   ├── API_KEY_SECURITY.md
│   ├── ARK_VS_COZE.md
│   ├── COZE_API_KEY_GUIDE.md
│   ├── COZE_VS_VOLCENGINE.md
│   └── ...
├── README.md              # 项目说明
├── QUICK_START.md         # 快速开始指南
├── NEXT_STEPS.md          # 下一步操作
└── SETUP_AI_GUIDE.md      # AI 接入教程
```

---

## 🔧 下载后需要做的事

### 1. 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
cd demo1
cp .env.example .env
```

### 2. 填写配置信息

用文本编辑器打开 `.env` 文件，填写：

```env
# API模式
VITE_API_MODE=edge-function

# Supabase 配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

### 3. 获取 Supabase 配置

1. 访问：https://supabase.com/dashboard
2. 登录你的账号
3. 找到你的项目
4. 复制 Project URL 和 anon public key
5. 填入 `.env` 文件

### 4. 获取 Coze API Key

按照 `QUICK_START.md` 中的步骤获取 API Key。

### 5. 配置到 Supabase Secrets

访问 Supabase 控制台，在 Edge Functions Settings 中配置：
- `COZE_API_KEY`: 你的豆包 API Key

---

## 🚀 启动项目

### 开发环境启动

```bash
cd demo1
pnpm install        # 安装依赖
pnpm dev            # 启动开发服务器
```

浏览器访问：http://localhost:5000

---

## 📚 重要文档

下载后，建议先阅读以下文档：

1. **README.md** - 项目概述和功能介绍
2. **QUICK_START.md** - 快速开始指南（小白必看！）
3. **NEXT_STEPS.md** - 完成配置后的操作步骤
4. **SETUP_AI_GUIDE.md** - AI 功能接入详细教程

---

## ⚠️ 注意事项

### 安全性

- ✅ `.env` 文件已经在 `.gitignore` 中，不会被提交
- ✅ 不要在公开场合分享你的 API Key
- ✅ 不要将 `.env` 文件提交到 Git

### 依赖安装

- ✅ 推荐使用 `pnpm` 而不是 `npm`
- ✅ 如果 `pnpm` 安装失败，可以尝试 `npm install`
- ✅ 删除 `node_modules` 文件夹后重新安装，可以解决很多问题

### 端口冲突

- ✅ 默认端口是 5000
- ✅ 如果端口被占用，会自动选择其他端口
- ✅ 可以在 `vite.config.ts` 中修改端口配置

---

## 🆘 常见问题

### Q: Git 克隆失败怎么办？

**A:** 尝试以下方法：
```bash
# 使用 SSH 方式克隆
git clone git@github.com:ruiyaoe-hash/demo1.git

# 或者使用 GitHub 网站下载 ZIP
```

### Q: pnpm install 很慢或失败？

**A:** 尝试使用国内镜像：
```bash
# 配置 pnpm 镜像
pnpm config set registry https://registry.npmmirror.com

# 然后再安装
pnpm install
```

### Q: 启动后访问不了？

**A:** 检查：
1. 防火墙是否阻止了 5000 端口
2. 是否正确填写了 `.env` 文件
3. 浏览器控制台是否有错误信息

### Q: 如何更新代码？

**A:** 使用 Git 拉取最新代码：
```bash
cd demo1
git pull origin master
pnpm install
```

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 README.md 中的说明
2. 查看 QUICK_START.md 中的详细步骤
3. 检查浏览器控制台的错误信息（F12）
4. 运行 `pnpm run lint` 检查代码问题

---

## 🎯 快速开始命令总结

```bash
# 1. 克隆项目
git clone https://github.com/ruiyaoe-hash/demo1.git
cd demo1

# 2. 安装依赖
pnpm install

# 3. 创建配置文件
cp .env.example .env

# 4. 编辑 .env 文件，填写配置信息

# 5. 启动开发服务器
pnpm dev

# 6. 打开浏览器访问
# http://localhost:5000
```

---

**祝使用愉快！🎉**
