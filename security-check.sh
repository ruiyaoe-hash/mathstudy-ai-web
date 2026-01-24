#!/bin/bash

# 安全检查脚本 - 验证是否有敏感信息被提交

echo "🔒 安全检查 - 验证代码仓库中的敏感信息"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查.gitignore是否正确配置
echo -e "${YELLOW}[1/5] 检查 .gitignore 配置...${NC}"
if [ -f ".gitignore" ]; then
    if grep -q "server/.env" .gitignore && grep -q "\.env" .gitignore; then
        echo -e "${GREEN}✅ .gitignore 配置正确${NC}"
    else
        echo -e "${RED}❌ .gitignore 配置不完整${NC}"
        echo "请确保 .gitignore 包含以下内容："
        echo "  server/.env"
        echo "  .env"
        echo "  .env.local"
    fi
else
    echo -e "${RED}❌ .gitignore 文件不存在${NC}"
    echo "请创建 .gitignore 文件"
fi

# 2. 检查是否有.env文件被跟踪
echo ""
echo -e "${YELLOW}[2/5] 检查是否有 .env 文件被跟踪...${NC}"
if git ls-files | grep -q "\.env"; then
    echo -e "${RED}❌ 发现被跟踪的 .env 文件：${NC}"
    git ls-files | grep "\.env"
    echo ""
    echo "请执行以下命令停止跟踪这些文件："
    echo "  git rm --cached <文件名>"
else
    echo -e "${GREEN}✅ 没有 .env 文件被跟踪${NC}"
fi

# 3. 检查历史提交中是否有API Key
echo ""
echo -e "${YELLOW}[3/5] 检查历史提交中是否有敏感信息...${NC}"
SENSITIVE_PATTERNS=(
    "COZE_API_KEY"
    "API_KEY"
    "SECRET"
    "PASSWORD"
    "TOKEN"
    "sk-"
    "pk-"
)

FOUND_SECRETS=0
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git log --all --source --full-history -S "$pattern" --oneline 2>/dev/null | grep -q .; then
        echo -e "${RED}⚠️  发现可能包含 \"$pattern\" 的提交${NC}"
        FOUND_SECRETS=$((FOUND_SECRETS + 1))
    fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ 未发现明显的敏感信息${NC}"
else
    echo ""
    echo "如果这些是误报，请忽略。如果确认包含真实API Key，请："
    echo "1. 立即在豆包平台撤销该API Key"
    echo "2. 创建新的API Key"
    echo "3. 使用 BFG Repo-Cleaner 清理历史："
    echo "   java -jar bfg.jar --replace-text secrets.txt"
    echo "4. 强制推送：git push --force"
fi

# 4. 检查当前文件中是否有硬编码的敏感信息
echo ""
echo -e "${YELLOW}[4/5] 检查当前代码中是否有硬编码的密钥...${NC}"

# 搜索常见的密钥模式
grep -r "COZE_API_KEY\s*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | grep -v "Deno.env.get\|process.env\|import.meta.env" | grep -v "// " > /tmp/hardcoded_secrets.txt

if [ -s /tmp/hardcoded_secrets.txt ]; then
    echo -e "${RED}❌ 发现硬编码的敏感信息：${NC}"
    cat /tmp/hardcoded_secrets.txt
    echo ""
    echo "请将硬编码的值改为环境变量引用："
    echo "  COZE_API_KEY=xxx  ->  process.env.COZE_API_KEY"
else
    echo -e "${GREEN}✅ 未发现硬编码的敏感信息${NC}"
fi
rm -f /tmp/hardcoded_secrets.txt

# 5. 检查server/.env.example
echo ""
echo -e "${YELLOW}[5/5] 检查 .env.example 文件...${NC}"
if [ -f "server/.env.example" ]; then
    if grep -q "your_.*_here" server/.env.example; then
        echo -e "${GREEN}✅ .env.example 配置正确（使用占位符）${NC}"
    else
        echo -e "${YELLOW}⚠️  请确保 .env.example 中使用占位符而不是真实密钥${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  server/.env.example 不存在${NC}"
    echo "建议创建 .env.example 文件作为配置模板"
fi

# 总结
echo ""
echo "========================================"
echo -e "${GREEN}安全检查完成！${NC}"
echo ""
echo "建议："
echo "1. 确保所有 .env 文件在 .gitignore 中"
echo "2. 不要提交任何真实的API Key"
echo "3. 定期运行此脚本检查"
echo "4. 生产环境使用环境变量注入，不要使用.env文件"
echo ""
