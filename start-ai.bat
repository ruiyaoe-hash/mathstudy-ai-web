@echo off
REM 星球主题教育游戏 - AI功能启动脚本 (Windows)

echo ==========================================
echo    星球主题教育游戏 - AI功能启动
echo ==========================================
echo.

REM 检查后端配置
echo [1/4] 检查后端配置...
if not exist "server\.env" (
    echo [错误] 后端配置文件不存在
    echo 请先执行: copy server\.env.example server\.env
    echo 然后编辑 server\.env 文件，填入 API Key 等配置
    pause
    exit /b 1
)

REM 检查是否配置了API Key
findstr /C:"your_coze_api_key_here" server\.env >nul
if %errorlevel% equ 0 (
    echo [警告] COZE_API_KEY 未配置
    echo 请在 server\.env 文件中填入豆包API Key
    echo 获取方式：访问 https://www.doubao.com/ 注册并获取
    echo.
    echo 如果没有API Key，AI功能将无法使用，但系统其他功能可以正常运行。
    set /p continue="是否继续启动？(y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

REM 检查前端配置
echo [2/4] 检查前端配置...
if not exist ".env" (
    echo [提示] 前端配置文件不存在，创建中...
    copy .env.example .env
    echo 请编辑 .env 文件，填入必要的配置
)

REM 检查依赖
echo [3/4] 检查依赖...
if not exist "node_modules\" (
    echo [提示] 安装前端依赖...
    call pnpm install
)

if not exist "server\node_modules\" (
    echo [提示] 安装后端依赖...
    cd server
    call pnpm install
    cd ..
)

REM 启动说明
echo.
echo [4/4] 配置检查完成
echo.
echo ==========================================
echo 启动说明：
echo.
echo 后端服务（AI功能）：
echo   cd server ^&^& pnpm dev
echo   访问：http://localhost:3001/health
echo.
echo 前端服务（Web应用）：
echo   pnpm dev
echo   访问：http://localhost:5000
echo.
echo ==========================================
echo 提示：
echo 1. 需要打开两个终端分别启动前后端服务
echo 2. 确保后端服务启动后，前端才能使用AI功能
echo 3. 如需配置说明，查看：docs\AI_CONFIG_GUIDE.md
echo.

set /p auto_start="是否自动启动后端服务？(y/n): "
if /i "%auto_start%"=="y" (
    echo.
    echo 启动后端服务...
    cd server
    start "后端服务" cmd /k "pnpm dev"
    echo 后端服务已在新窗口启动
    echo.
    echo 请在另一个终端执行：pnpm dev
    echo.
) else (
    echo.
    echo 请手动启动服务：
    echo   后端：cd server ^&^& pnpm dev
    echo   前端：pnpm dev
    echo.
)

pause
