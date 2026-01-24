#!/bin/bash

# 星球主题教育游戏 - AI功能启动脚本

echo "🚀 星球主题教育游戏 - AI功能启动"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查后端配置
echo -e "\n${YELLOW}1. 检查后端配置...${NC}"
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ 后端配置文件不存在${NC}"
    echo "请先执行: cp server/.env.example server/.env"
    echo "然后编辑 server/.env 文件，填入 API Key 等配置"
    exit 1
fi

# 检查是否配置了API Key
if ! grep -q "COZE_API_KEY=" server/.env || grep -q "your_coze_api_key_here" server/.env; then
    echo -e "${RED}❌ COZE_API_KEY 未配置${NC}"
    echo "请在 server/.env 文件中填入豆包API Key"
    echo "获取方式：访问 https://www.doubao.com/ 注册并获取"
    echo ""
    echo "如果没有API Key，AI功能将无法使用，但系统其他功能可以正常运行。"
    read -p "是否继续启动？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查前端配置
echo -e "\n${YELLOW}2. 检查前端配置...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  前端配置文件不存在，创建中...${NC}"
    cp .env.example .env
    echo "请编辑 .env 文件，填入必要的配置"
fi

# 检查依赖
echo -e "\n${YELLOW}3. 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    pnpm install
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}安装后端依赖...${NC}"
    cd server
    pnpm install
    cd ..
fi

# 启动服务
echo -e "\n${YELLOW}4. 启动服务...${NC}"
echo -e "${GREEN}✅ 配置检查完成${NC}"
echo ""
echo "=================================="
echo -e "${GREEN}启动说明：${NC}"
echo ""
echo "后端服务（AI功能）："
echo "  cd server && pnpm dev"
echo "  访问：http://localhost:3001/health"
echo ""
echo "前端服务（Web应用）："
echo "  pnpm dev"
echo "  访问：http://localhost:5000"
echo ""
echo "=================================="
echo -e "${YELLOW}提示：${NC}"
echo "1. 需要打开两个终端分别启动前后端服务"
echo "2. 确保后端服务启动后，前端才能使用AI功能"
echo "3. 如需配置说明，查看：docs/AI_CONFIG_GUIDE.md"
echo ""

read -p "是否自动启动后端服务？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}启动后端服务...${NC}"
    cd server
    pnpm dev
else
    echo -e "${YELLOW}请手动启动服务${NC}"
    echo "后端：cd server && pnpm dev"
    echo "前端：pnpm dev"
fi
