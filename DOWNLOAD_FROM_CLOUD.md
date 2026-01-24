# 📦 项目代码下载指南

## ✅ 项目已打包完成

项目代码已经打包成压缩文件，可以下载到本地！

---

## 📁 文件信息

**文件名**：`planet-education-ai.tar.gz`
**大小**：288KB
**位置**：`/workspace/projects/planet-education-ai.tar.gz`
**包含文件**：100+ 个文件和目录

---

## 🚀 下载方法

### 方法1：通过coze编程界面下载（推荐）

1. 在coze编程云端的文件浏览器中
2. 导航到 `/workspace/projects/` 目录
3. 找到 `planet-education-ai.tar.gz` 文件
4. 点击下载按钮下载到本地

---

### 方法2：使用命令行下载

如果你能访问终端，可以使用以下命令：

```bash
# 如果在服务器上，使用scp下载
scp user@server:/workspace/projects/planet-education-ai.tar.gz /本地路径/

# 或者使用rsync
rsync -avz user@server:/workspace/projects/planet-education-ai.tar.gz /本地路径/
```

---

## 📂 解压方法

下载到本地后，解压方法：

### Windows

1. 下载并安装 7-Zip：https://www.7-zip.org/
2. 右键点击 `planet-education-ai.tar.gz`
3. 选择 "7-Zip" → "提取到当前位置"

### Mac

```bash
# 双击文件自动解压
# 或使用命令行
tar -xzf planet-education-ai.tar.gz
```

### Linux

```bash
tar -xzf planet-education-ai.tar.gz
```

---

## 📂 解压后的项目结构

解压后会得到 `demo1/` 目录，结构如下：

```
demo1/
├── src/                    # 源代码
│   ├── ai/               # AI系统
│   ├── components/       # React组件
│   ├── pages/           # 页面
│   ├── services/        # 服务层
│   ├── hooks/           # Hooks
│   ├── core/            # 核心算法
│   └── lib/             # 工具库
├── supabase/            # Supabase配置
│   ├── functions/       # Edge Functions
│   └── migrations/      # 数据库迁移
├── server/              # Express后端
├── docs/                # 文档（20+个）
├── database/            # 数据库脚本
├── package.json         # 依赖配置
├── .env.example         # 环境变量示例
├── README.md            # 项目说明
└── QUICK_START.md       # 快速开始指南
```

---

## 🔧 解压后的操作步骤

### 第1步：进入项目目录

```bash
cd demo1
```

### 第2步：安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或者使用 npm
npm install
```

### 第3步：创建配置文件

```bash
# 复制示例配置
cp .env.example .env

# 编辑 .env 文件，填写你的配置信息
```

### 第4步：启动项目

```bash
# 开发环境
pnpm dev

# 或使用 npm
npm run dev
```

浏览器访问：http://localhost:5000

---

## 📋 配置说明

需要配置的环境变量（在 `.env` 文件中）：

```env
# API模式
VITE_API_MODE=edge-function

# Supabase配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

详细配置步骤请查看 `QUICK_START.md`。

---

## 📚 重要文档

解压后，建议先阅读以下文档：

1. **README.md** - 项目概述
2. **QUICK_START.md** - 快速开始指南（小白必看！）
3. **NEXT_STEPS.md** - 下一步操作
4. **PUSH_TO_GITHUB.md** - GitHub推送指南

---

## ⚠️ 注意事项

### 已排除的文件

压缩包中已排除以下文件，解压后需要单独处理：

- ❌ `node_modules/` - 依赖包（解压后需要 `pnpm install`）
- ❌ `.git/` - Git历史
- ❌ `dist/` - 构建输出
- ❌ `.vite/` - Vite缓存

### 安全提示

- ✅ `.env` 文件不在压缩包中（需要自己创建）
- ✅ 只包含 `.env.example`（安全模板）
- ✅ 不会有敏感信息泄露

---

## 🆘 常见问题

### Q: 解压后项目无法启动？

**A:** 检查：
1. 是否安装了 Node.js（需要 v18+）
2. 是否安装了 pnpm 或 npm
3. 是否运行了 `pnpm install`
4. 是否正确配置了 `.env` 文件

### Q: 下载的文件损坏？

**A:** 重新下载，确保下载完整

### Q: 如何验证下载的文件？

**A:** 解压后检查：
1. 文件数量应该有 100+ 个
2. `src/ai/` 目录存在
3. `supabase/functions/` 目录存在
4. 所有 `.md` 文档存在

---

## 🎯 快速命令总结

```bash
# 1. 解压
tar -xzf planet-education-ai.tar.gz

# 2. 进入项目
cd demo1

# 3. 安装依赖
pnpm install

# 4. 创建配置
cp .env.example .env
# 编辑 .env 文件

# 5. 启动项目
pnpm dev

# 6. 访问
# http://localhost:5000
```

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 `QUICK_START.md`
2. 查看 `docs/TROUBLESHOOTING.md`
3. 检查浏览器控制台错误（F12）

---

**压缩包已准备好，请在coze编程界面下载！** 🚀
