#!/bin/bash

# 部署 Edge Functions 到 Supabase

echo "开始部署 Edge Functions 到 Supabase..."

# 检查是否安装了 supabase  CLI
if ! command -v supabase &> /dev/null; then
    echo "错误: supabase CLI 未安装"
    echo "请按照 https://supabase.com/docs/guides/cli/getting-started 的说明安装"
    exit 1
fi

# 检查是否配置了 SUPABASE_URL 和 SUPABASE_ANON_KEY
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "警告: 环境变量 SUPABASE_URL 或 SUPABASE_ANON_KEY 未设置"
    echo "将使用 supabase 配置文件中的默认值"
fi

# 进入 supabase 目录
cd "$(dirname "$0")/supabase" || exit 1

# 登录到 Supabase
echo "正在登录到 Supabase..."
supabase login

# 部署 Edge Functions
echo "部署 AI 服务 Edge Function..."
supabase functions deploy ai-service

# 部署完成
echo ""
echo "✅ Edge Functions 部署完成!"
echo ""
echo "部署信息:"
echo "- AI 服务: 已部署到 /functions/v1/ai-service"
echo "- 支持的操作: generate-questions, solve-question, chat, explain-concept, analyze-mistake, learning-tips"
echo "- 默认提供商: zhipu (智谱AI)"
echo ""
echo "测试命令:"
echo "  curl 'https://your-project.supabase.co/functions/v1/ai-service?action=health&provider=zhipu' \\
  -H 'Authorization: Bearer your-anon-key'"
echo ""
echo "请在 Supabase 控制台中设置环境变量:"
echo "- ZHIPU_API_KEY: 智谱AI API 密钥"
echo "- COZE_API_KEY: Coze API 密钥 (可选)"
echo "- SUPABASE_URL: Supabase 项目 URL"
echo "- SUPABASE_SERVICE_ROLE_KEY: Supabase 服务角色密钥"
echo ""
echo "部署过程已完成!"
