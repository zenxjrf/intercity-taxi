@echo off
chcp 65001 >nul

:: Windows GitHub Push Script for Intercity Taxi
:: Run this in PowerShell or CMD

echo 🚀 Intercity Taxi - GitHub Push Script for Windows
echo ===================================================
echo.

:: Configuration
set GITHUB_USER=zenxjrf
set REPO_NAME=intercity-taxi
set PROJECT_DIR=%~dp0

cd /d "%PROJECT_DIR%"

echo 📦 Project Directory: %PROJECT_DIR%
echo 🔗 Repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo 🔧 Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Initialize git if needed
if not exist ".git" (
    echo 🔧 Initializing git repository...
    git init
    git branch -M main
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)

:: Check remote
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔗 Adding remote origin...
    git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
) else (
    echo 🔗 Updating remote origin...
    git remote set-url origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
)

echo.
echo 📊 Git Status:
git status

echo.
echo ➕ Adding all files to git...
git add .

echo.
echo 💾 Creating commit...
git commit -m "Initial commit: Intercity Taxi Telegram Bot + Web App" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Nothing new to commit
)

echo.
echo 📤 Pushing to GitHub...
echo ⚠️  You may need to enter your GitHub credentials
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Project pushed to GitHub!
    echo.
    echo 🔗 Repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo.
    echo 🎯 Next Steps:
    echo    1. Go to https://dashboard.render.com/blueprints
    echo    2. Click "New Blueprint Instance"
    echo    3. Select: %GITHUB_USER%/%REPO_NAME%
    echo    4. Click "Apply" - Render will create everything automatically
    echo    5. After deployment, add environment variables in Render Dashboard
    echo.
    echo 📋 Environment Variables to add:
    echo    BOT_TOKEN=8606991774:AAGoHuOW3OCpN9n03U0gxKv5eDB27br60OQ
    echo    ADMIN_TELEGRAM_ID=1698158035
    echo.
) else (
    echo.
    echo ❌ Push failed!
    echo.
    echo 🔧 To fix:
    echo    1. Create the repository first:
    echo       https://github.com/new?name=%REPO_NAME%
    echo    2. Run this script again
    echo.
    echo 💡 Or if you have authentication issues:
    echo    - Use GitHub Desktop: https://desktop.github.com
    echo    - Or set up SSH keys: https://docs.github.com/en/authentication
    echo.
)

pause
