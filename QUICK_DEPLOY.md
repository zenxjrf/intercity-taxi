# Quick Deploy Scripts

## Для Windows (PowerShell/CMD):
```
push-to-github.bat
```

## Для Linux/Mac (Bash):
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```

## После пуша на GitHub:
```bash
chmod +x setup-render.sh
./setup-render.sh
```

## Полный автоматический деплой (Windows PowerShell):
```powershell
# 1. Push to GitHub
.\push-to-github.bat

# 2. Откройте браузер и перейдите на Render
start https://dashboard.render.com/blueprints
```

## Что произойдёт автоматически:

1. ✅ Скрипт инициализирует git (если нужно)
2. ✅ Добавит remote origin на github.com/zenxjrf/intercity-taxi
3. ✅ Создаст commit со всеми файлами
4. ✅ Запушит на GitHub
5. ⚠️  Вас попросят ввести GitHub credentials (это нормально)

## После пуша:

1. Перейдите на https://dashboard.render.com/blueprints
2. Нажмите "New Blueprint Instance"
3. Выберите репозиторий `zenxjrf/intercity-taxi`
4. Нажмите "Apply"

Render автоматически создаст:
- 🗄️ PostgreSQL базу данных
- ⚡ Redis для кэширования
- 🔧 Backend API (Docker)
- 🌐 Frontend статический сайт (Nginx)

## После создания сервисов:

Добавьте в Backend Service → Environment:
```
BOT_TOKEN=8606991774:AAGoHuOW3OCpN9n03U0gxKv5eDB27br60OQ
ADMIN_TELEGRAM_ID=1698158035
```

Затем запустите миграции:
```bash
# В Render Dashboard → Backend Service → Shell
cd src/database && node migrate.js
```

## Автодеплой:

Уже настроен! Каждый пуш в `main` ветку будет автоматически деплоиться на Render.
