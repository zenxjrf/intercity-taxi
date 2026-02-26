# Деплой на Render.com

## Подготовка

### 1. Создайте аккаунт на Render
- Зарегистрируйтесь на [render.com](https://render.com)
- Подключите GitHub репозиторий

### 2. Подготовьте Telegram Bot
- Создайте бота через [@BotFather](https://t.me/BotFather)
- Получите токен бота (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
- Узнайте свой Telegram ID через [@userinfobot](https://t.me/userinfobot)

## Шаги деплоя

### Шаг 1: Blueprint деплой (рекомендуется)

Render поддерживает деплой через `render.yaml` файл:

1. Запушьте код в GitHub репозиторий
2. В Render Dashboard нажмите **"New +"** → **"Blueprint"**
3. Выберите ваш репозиторий
4. Render автоматически создаст:
   - PostgreSQL базу данных
   - Redis для кэширования
   - Backend сервис
   - Frontend статический сайт

### Шаг 2: Настройка переменных окружения

После создания сервисов, добавьте эти переменные вручную:

**Backend Service → Environment:**
```
BOT_TOKEN=ваш_токен_от_BotFather
ADMIN_TELEGRAM_ID=ваш_telegram_id
```

### Шаг 3: Запуск миграций

В Render Dashboard для backend сервиса:
1. Перейдите в **Shell** таб
2. Выполните:
```bash
cd src/database && node migrate.js
```

### Шаг 4: Настройка Webhook (после деплоя)

После того как backend получит URL:
1. Перейдите в Telegram [@BotFather](https://t.me/BotFather)
2. Отправьте: `/setdomain`
3. Выберите вашего бота
4. Введите URL фронтенда (например: `https://intercity-taxi-frontend.onrender.com`)
5. Отправьте: `/setcommands`
6. Установите команды:
```
start - Начать работу с ботом
help - Помощь
admin - Панель администратора
```

### Шаг 5: Настройка Menu Button (Web App)

В [@BotFather](https://t.me/BotFather):
1. Отправьте: `/mybots`
2. Выберите бота
3. Нажмите **"Bot Settings"** → **"Menu Button"** → **"Configure menu button"**
4. Введите название кнопки: `Открыть приложение`
5. Введите URL: `https://ваш-frontend.onrender.com`

## Альтернативный деплой (вручную)

Если Blueprint не сработал, создайте сервисы вручную:

### 1. PostgreSQL Database
- **New +** → **PostgreSQL**
- Name: `intercity-taxi-db`
- Plan: Free

### 2. Redis
- **New +** → **Redis**
- Name: `intercity-taxi-redis`
- Plan: Free

### 3. Backend (Web Service)
- **New +** → **Web Service**
- Выберите репозиторий
- Name: `intercity-taxi-backend`
- Root Directory: `backend`
- Runtime: `Docker`
- Plan: Free

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
BOT_TOKEN=ваш_токен
WEB_APP_URL=https://intercity-taxi-frontend.onrender.com
ADMIN_TELEGRAM_ID=ваш_id
# Остальные переменные для DB и Redis подтянутся автоматически
```

### 4. Frontend (Static Site)
- **New +** → **Static Site**
- Выберите репозиторий
- Name: `intercity-taxi-frontend`
- Root Directory: `frontend`
- Build Command: `docker build -t frontend .` (или оставьте пустым для Dockerfile)
- Publish Directory: `/usr/share/nginx/html`

**Environment Variables:**
```
VITE_API_URL=https://intercity-taxi-backend.onrender.com
```

## Проверка после деплоя

1. Откройте бота в Telegram
2. Нажмите кнопку "Открыть приложение"
3. Проверьте:
   - ✅ Главная страница загружается
   - ✅ Можно выбрать маршрут
   - ✅ Формы заказа работают
   - ✅ Уведомления приходят

## Решение проблем

### "Invalid hash" при авторизации
- Убедитесь что `BOT_TOKEN` правильный
- Проверьте что домен настроен в @BotFather

### Не приходят уведомления
- Проверьте `WEBHOOK_URL` — должен заканчиваться на `/webhook`
- Убедитесь что webhook установлен: откройте `https://your-backend.onrender.com/webhook` в браузере

### CORS ошибки
- Проверьте что `WEB_APP_URL` совпадает с фактическим URL фронтенда
- В server.js CORS настроен на `https://*.onrender.com`

### База данных не подключается
- Проверьте переменные окружения DB_*
- Убедитесь что миграции выполнены

## Обновление проекта

При пуше нового кода в main ветку:
1. Render автоматически пересоберёт и перезапустит сервисы
2. База данных и Redis сохранятся

## Локальная разработка

Для локальной разработки без Telegram:
```bash
cd backend
npm install
echo "NODE_ENV=development" > .env
npm run dev

cd frontend
npm install
npm run dev
```

В development mode авторизация проходит без проверки Telegram hash.
