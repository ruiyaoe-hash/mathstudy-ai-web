#!/bin/bash

# Supabase Edge Functions 部署脚本

echo "🚀 Supabase Edge Functions 部署"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Supabase CLI
echo -e "\n${YELLOW}[1/5] 检查 Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI 未安装${NC}"
    echo "请安装: pnpm add -g supabase"
    exit 1
fi
echo -e "${GREEN}✅ Supabase CLI 已安装${NC}"

# 检查是否已登录
echo -e "\n${YELLOW}[2/5] 检查登录状态...${NC}"
if ! supabase status 2>/dev/null | grep -q "API URL"; then
    echo -e "${YELLOW}⚠️  未登录或未初始化${NC}"
    read -p "是否登录 Supabase? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase login
    else
        echo -e "${RED}❌ 需要登录才能部署${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 已登录${NC}"

# 检查Functions目录
echo -e "\n${YELLOW}[3/5] 检查 Functions 目录...${NC}"
if [ ! -d "supabase/functions" ]; then
    echo -e "${RED}❌ supabase/functions 目录不存在${NC}"
    exit 1
fi

# 列出所有functions
FUNCTIONS=$(ls -1 supabase/functions)
echo -e "${GREEN}✅ 发现 Functions:${NC}"
echo "$FUNCTIONS"

# 确认部署
echo -e "\n${YELLOW}[4/5] 准备部署...${NC}"
read -p "是否部署所有 Functions? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署取消"
    exit 0
fi

# 部署Functions
echo -e "\n${YELLOW}[5/5] 部署 Functions...${NC}"
for func in $FUNCTIONS; do
    echo -e "\n部署 ${func}..."
    supabase functions deploy "$func" --no-verify-jwt
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${func} 部署成功${NC}"
    else
        echo -e "${RED}❌ ${func} 部署失败${NC}"
    fi
done

# 显示日志信息
echo -e "\n${YELLOW}=================================="
echo -e "${GREEN}部署完成！${NC}"
echo ""
echo "下一步："
echo "1. 在 Supabase 控制台配置 Secrets:"
echo "   COZE_API_KEY=your_api_key"
echo "   COZE_BASE_URL=https://api.coze.com"
echo "   COZE_MODEL_BASE_URL=https://model.coze.com"
echo ""
echo "2. 测试 Functions:"
echo "   curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health"
echo ""
echo "3. 查看日志:"
echo "   supabase functions logs ai-service"
echo ""
