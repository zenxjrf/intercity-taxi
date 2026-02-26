#!/bin/bash

# Render Deployment Setup Script
# This script helps setup the Render deployment after GitHub push

set -e

echo "🚀 Intercity Taxi - Render Deployment Setup"
echo "============================================"
echo ""

# Configuration
GITHUB_USER="zenxjrf"
REPO_NAME="intercity-taxi"
BOT_TOKEN="8606991774:AAGoHuOW3OCpN9n03U0gxKv5eDB27br60OQ"
ADMIN_TG_ID="1698158035"

echo "📦 Configuration:"
echo "   GitHub Repo: ${GITHUB_USER}/${REPO_NAME}"
echo "   Admin TG ID: ${ADMIN_TG_ID}"
echo ""

echo "📋 Deployment Checklist:"
echo ""
echo "1️⃣  Push code to GitHub (run push-to-github.sh first)"
echo ""
echo "2️⃣  Create Render Blueprint:"
echo "   → Go to: https://dashboard.render.com/blueprints"
echo "   → Click 'New Blueprint Instance'"
echo "   → Select repository: ${GITHUB_USER}/${REPO_NAME}"
echo "   → Click 'Apply'"
echo ""
echo "3️⃣  After Blueprint creates services, add SECRETS:"
echo ""
echo "   Backend Service → Environment Variables:"
echo "   ┌─────────────────────────────────────────────────┐"
echo "   │ BOT_TOKEN=${BOT_TOKEN}    │"
echo "   │ ADMIN_TELEGRAM_ID=${ADMIN_TG_ID}                  │"
echo "   └─────────────────────────────────────────────────┘"
echo ""
echo "4️⃣  Run database migrations:"
echo "   → In Render Dashboard, go to Backend Service"
echo "   → Click 'Shell' tab"
echo "   → Run: cd src/database && node migrate.js"
echo ""
echo "5️⃣  Setup Telegram Bot:"
echo "   → Go to @BotFather"
echo "   → Send: /setdomain"
echo "   → Select your bot"
echo "   → Enter your frontend URL (shown in Render dashboard)"
echo ""
echo "🔗 Useful Links:"
echo "   Render Dashboard: https://dashboard.render.com"
echo "   GitHub Repo: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "✅ Auto-deploy is already configured!"
echo "   Every push to 'main' branch will automatically redeploy."
echo ""

# Optional: Open browser links (for Linux/Mac with xdg-open or open)
if command -v xdg-open &> /dev/null; then
    read -p "🌐 Open Render Dashboard? (y/n): " open_browser
    if [[ $open_browser == "y" || $open_browser == "Y" ]]; then
        xdg-open "https://dashboard.render.com/blueprints" &
    fi
elif command -v open &> /dev/null; then
    read -p "🌐 Open Render Dashboard? (y/n): " open_browser
    if [[ $open_browser == "y" || $open_browser == "Y" ]]; then
        open "https://dashboard.render.com/blueprints" &
    fi
fi

echo ""
echo "🎉 Setup guide complete!"
echo ""
