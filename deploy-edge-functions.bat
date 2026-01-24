@echo off
REM Supabase Edge Functions 部署脚本 (Windows)

echo ==========================================
echo   Supabase Edge Functions 部署
echo ==========================================
echo.

REM 检查Supabase CLI
echo [1/5] 检查 Supabase CLI...
where supabase >nul
if %errorlevel% neq 0 (
    echo [ERROR] Supabase CLI 未安装
    echo 请安装: pnpm add -g supabase
    pause
    exit /b 1
)
echo [OK] Supabase CLI 已安装

REM 检查是否已登录
echo.
echo [2/5] 检查登录状态...
supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] 未登录或未初始化
    set /p login="是否登录 Supabase? (y/n): "
    if /i "%login%"=="y" (
        supabase login
    ) else (
        echo [ERROR] 需要登录才能部署
        pause
        exit /b 1
    )
)
echo [OK] 已登录

REM 检查Functions目录
echo.
echo [3/5] 检查 Functions 目录...
if not exist "supabase\functions" (
    echo [ERROR] supabase\functions 目录不存在
    pause
    exit /b 1
)
echo [OK] Functions 目录存在

REM 列出所有functions
echo.
echo [4/5] 准备部署...
dir /B "supabase\functions"
echo.

REM 确认部署
set /p confirm="是否部署所有 Functions? (y/n): "
if /i not "%confirm%"=="y" (
    echo 部署取消
    pause
    exit /b 0
)

REM 部署Functions
echo.
echo [5/5] 部署 Functions...
echo.

for /D %%f in (supabase\functions\*) do (
    echo 部署 %%~nxf...
    supabase functions deploy %%~nxf --no-verify-jwt
    if %errorlevel% equ 0 (
        echo [OK] %%~nxf 部署成功
    ) else (
        echo [ERROR] %%~nxf 部署失败
    )
    echo.
)

echo ==========================================
echo 部署完成！
echo.
echo 下一步：
echo 1. 在 Supabase 控制台配置 Secrets:
echo    COZE_API_KEY=your_api_key
echo    COZE_BASE_URL=https://api.coze.com
echo    COZE_MODEL_BASE_URL=https://model.coze.com
echo.
echo 2. 测试 Functions:
echo    curl https://your-project-ref.supabase.co/functions/v1/ai-service?action=health
echo.
echo 3. 查看日志:
echo    supabase functions logs ai-service
echo.

pause
