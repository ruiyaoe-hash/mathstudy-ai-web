@echo off
REM 安全检查脚本 - 验证是否有敏感信息被提交 (Windows)

echo 🔒 安全检查 - 验证代码仓库中的敏感信息
echo ========================================
echo.

REM 检查.gitignore是否正确配置
echo [1/5] 检查 .gitignore 配置...
if exist ".gitignore" (
    findstr /C:"server/.env" .gitignore >nul
    if %errorlevel% equ 0 (
        findstr /C:".env" .gitignore >nul
        if %errorlevel% equ 0 (
            echo [OK] .gitignore 配置正确
        ) else (
            echo [ERROR] .gitignore 配置不完整
            echo 请确保 .gitignore 包含 .env
        )
    ) else (
        echo [ERROR] .gitignore 配置不完整
        echo 请确保 .gitignore 包含 server/.env
    )
) else (
    echo [ERROR] .gitignore 文件不存在
)

echo.

REM 检查是否有.env文件被跟踪
echo [2/5] 检查是否有 .env 文件被跟踪...
git ls-files | findstr ".env" >nul
if %errorlevel% equ 0 (
    echo [ERROR] 发现被跟踪的 .env 文件：
    git ls-files | findstr ".env"
    echo.
    echo 请执行以下命令停止跟踪这些文件：
    echo   git rm --cached ^<文件名^>
) else (
    echo [OK] 没有 .env 文件被跟踪
)

echo.

REM 检查当前文件中是否有硬编码的敏感信息
echo [3/5] 检查当前代码中是否有硬编码的密钥...
REM 搜索常见的密钥模式（简化版）
findstr /S /I /C:"COZE_API_KEY" *.ts *.tsx *.js *.jsx 2>nul | findstr /V "Deno.env.get process.env import.meta.env" | findstr /V "://" > temp_check.txt
if %errorlevel% equ 0 (
    echo [WARNING] 发现可能的硬编码敏感信息：
    type temp_check.txt
    del temp_check.txt
    echo.
    echo 请将硬编码的值改为环境变量引用
) else (
    echo [OK] 未发现明显的硬编码敏感信息
    if exist temp_check.txt del temp_check.txt
)

echo.

REM 检查server/.env.example
echo [4/5] 检查 .env.example 文件...
if exist "server\.env.example" (
    findstr /C:"your_" server\.env.example | findstr /C:"_here" >nul
    if %errorlevel% equ 0 (
        echo [OK] .env.example 配置正确（使用占位符）
    ) else (
        echo [WARNING] 请确保 .env.example 中使用占位符
    )
) else (
    echo [WARNING] server\.env.example 不存在
)

echo.
echo ========================================
echo 安全检查完成！
echo.
echo 建议：
echo 1. 确保所有 .env 文件在 .gitignore 中
echo 2. 不要提交任何真实的API Key
echo 3. 生产环境使用环境变量注入
echo 4. 定期运行此脚本检查
echo.

pause
