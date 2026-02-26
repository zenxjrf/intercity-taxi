#!/bin/bash

# GitHub Push Automation Script
# Run this to push the project to GitHub

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Intercity Taxi - GitHub Push Script"
echo "========================================"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# GitHub username and repo
GITHUB_USER="zenxjrf"
REPO_NAME="intercity-taxi"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "📦 GitHub Repository: ${REPO_URL}"
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git branch -M main
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Adding remote origin..."
    git remote add origin ${REPO_URL}
    echo "✅ Remote origin added"
else
    echo "🔗 Updating remote origin..."
    git remote set-url origin ${REPO_URL}
    echo "✅ Remote origin updated"
fi

echo ""
echo "📊 Git Status:"
git status

echo ""
echo "➕ Adding all files..."
git add .

echo ""
read -p "💬 Enter commit message (default: 'Initial commit: Intercity Taxi Telegram Bot + Web App'): " commit_msg
commit_msg=${commit_msg:-"Initial commit: Intercity Taxi Telegram Bot + Web App"}

echo "💾 Creating commit..."
git commit -m "$commit_msg" || echo "⚠️  Nothing to commit (already up to date)"

echo ""
echo "📤 Pushing to GitHub..."
echo "⚠️  You may be prompted for your GitHub credentials"
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Project pushed to GitHub"
    echo ""
    echo "🔗 Repository URL: ${REPO_URL}"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Go to https://dashboard.render.com"
    echo "   2. Click 'New +' → 'Blueprint'"
    echo "   3. Select repository: ${GITHUB_USER}/${REPO_NAME}"
    echo "   4. Render will automatically create all services"
    echo "   5. After deployment, add BOT_TOKEN to environment variables"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Repository doesn't exist on GitHub - create it first at:"
    echo "      https://github.com/new"
    echo "   2. Authentication failed - check your GitHub credentials"
    echo "   3. Remote URL is wrong - check GITHUB_USER variable in this script"
    echo ""
    echo "🔧 To fix:"
    echo "   1. Create repo: https://github.com/new?name=${REPO_NAME}"
    echo "   2. Run this script again"
    echo ""
    exit 1
fi
