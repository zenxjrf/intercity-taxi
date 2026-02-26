# Междугороднее Такси - Telegram Bot + Web App

Полноценный сервис для заказа междугородних поездок, отправки посылок и перегона автомобилей через Telegram Bot и Web App.

## Функционал

### Для клиентов:
- Просмотр цен на поездки, посылки и перегон автомобилей
- Просмотр списка свободных водителей
- Оформление заказов трёх типов:
  - 🚗 Поездка с указанием даты, времени и количества пассажиров
  - 📦 Отправка посылки с расчётом по весу
  - 🚙 Перегон автомобиля (только водители с соответствующим разрешением)
- История заказов с фильтрацией
- Оценка водителей после завершения поездки

### Для водителей:
- Управление статусом онлайн/офлайн
- Просмотр доступных заявок по рабочим маршрутам
- Принятие/отклонение заказов
- Управление статусами заказа (выехал, в пути, завершён)
- Просмотр профиля и статистики
- История выполненных заказов

### Для администраторов:
- Управление водителями (добавление, блокировка, редактирование)
- Управление ценами и маршрутами
- Просмотр всех заказов с фильтрами
- Общая статистика и аналитика
- Графики заказов по дням
- Рейтинг водителей
- Рассылка уведомлений

## Технический стек

**Backend:**
- Node.js + Express.js
- PostgreSQL (основная база данных)
- Redis (кэширование и очереди)
- Telegraf.js (Telegram Bot SDK)

**Frontend:**
- React 18
- Vite (сборка)
- TailwindCSS (стили)
- Zustand (state management)

## Установка и запуск

### 1. Подготовка окружения

```bash
# Установите Node.js 18+
# Установите PostgreSQL 14+
# Установите Redis
```

### 2. Настройка базы данных

```bash
# Создайте базу данных
createdb intercity_taxi

# Запустите миграции
cd backend
npm run migrate
```

### 3. Настройка backend

```bash
cd backend

# Скопируйте .env.example в .env и заполните
cp .env.example .env

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev

# Или в production
npm start
```

### 4. Настройка frontend

```bash
cd frontend

# Установите зависимости
npm install

# Запустите dev сервер
npm run dev

# Соберите для production
npm run build
```

### 5. Настройка Telegram Bot

1. Создайте бота через @BotFather
2. Получите токен и добавьте в `.env`
3. Настройте Web App URL через @BotFather
4. Добавьте свой Telegram ID в `ADMIN_TELEGRAM_ID`

### 6. Production деплой

```bash
# Установите PM2
npm install -g pm2

# Запустите backend через PM2
pm2 start server.js --name taxi-backend

# Настройте Nginx как reverse proxy
# Получите SSL сертификат Let's Encrypt
```

## Структура проекта

```
intercity-taxi/
├── backend/
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── bot/          # Telegram bot handlers
│   │   ├── database/     # Миграции и подключение
│   │   ├── services/     # Бизнес-логика
│   │   └── utils/        # Утилиты
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # React компоненты страниц
│   │   ├── components/   # Переиспользуемые компоненты
│   │   ├── store/        # Zustand store
│   │   └── api/          # API клиент
│   └── index.html
│
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/verify` - Верификация Telegram initData

### Prices
- `GET /api/prices` - Список маршрутов
- `GET /api/prices/:from/:to` - Цена для конкретного маршрута
- `POST /api/prices` - Создать маршрут (admin)
- `PUT /api/prices/:id` - Обновить цены (admin)
- `DELETE /api/prices/:id` - Удалить маршрут (admin)

### Drivers
- `GET /api/drivers/online` - Список онлайн водителей
- `GET /api/drivers/online/count` - Количество онлайн водителей
- `GET /api/drivers/:id` - Профиль водителя
- `POST /api/drivers` - Добавить водителя (admin)
- `PATCH /api/drivers/:id/status` - Переключить статус (driver)
- `PATCH /api/drivers/:id/block` - Блокировать/разблокировать (admin)

### Orders
- `GET /api/orders` - Все заказы (admin)
- `GET /api/orders/my` - Мои заказы
- `GET /api/orders/available` - Доступные заявки (driver)
- `POST /api/orders` - Создать заказ (client)
- `PATCH /api/orders/:id/accept` - Принять заказ (driver)
- `PATCH /api/orders/:id/status` - Обновить статус
- `PATCH /api/orders/:id/cancel` - Отменить заказ

### Reviews
- `POST /api/reviews` - Добавить отзыв (client)
- `GET /api/reviews/driver/:id` - Отзывы о водителе

### Stats
- `GET /api/stats/overview` - Общая статистика (admin)
- `GET /api/stats/drivers` - Статистика по водителям (admin)
- `GET /api/stats/routes` - Статистика по маршрутам (admin)
- `GET /api/stats/chart` - График заказов (admin)

### Broadcast
- `POST /api/broadcast` - Массовая рассылка (admin)

## Лицензия

MIT
