const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Web app button for all users
bot.start(async (ctx) => {
  const webAppUrl = process.env.WEB_APP_URL;
  
  await ctx.reply(
    '👋 Добро пожаловать в сервис междугороднего такси!\n\n' +
    'Здесь вы можете:\n' +
    '🚗 Заказать поездку\n' +
    '📦 Отправить посылку\n' +
    '🚙 Заказать перегон автомобиля',
    {
      reply_markup: {
        keyboard: [[{ text: 'Открыть приложение', web_app: { url: webAppUrl } }]],
        resize_keyboard: true
      }
    }
  );
});

// Admin command
bot.command('admin', async (ctx) => {
  const adminIds = process.env.ADMIN_TELEGRAM_ID ? process.env.ADMIN_TELEGRAM_ID.split(',').map(id => id.trim()) : [];
  
  if (!adminIds.includes(ctx.from.id.toString())) {
    return ctx.reply('❌ Доступ запрещен');
  }
  
  const webAppUrl = `${process.env.WEB_APP_URL}/admin`;
  
  await ctx.reply(
    '🔐 Панель администратора\n\n' +
    'Выберите действие:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Статистика', web_app: { url: `${webAppUrl}/stats` } }],
          [{ text: '👤 Водители', web_app: { url: `${webAppUrl}/drivers` } }],
          [{ text: '💰 Цены', web_app: { url: `${webAppUrl}/prices` } }],
          [{ text: '📋 Заказы', web_app: { url: `${webAppUrl}/orders` } }]
        ]
      }
    }
  );
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    '📖 Помощь\n\n' +
    '/start - Открыть главное меню\n' +
    '/help - Показать эту справку\n\n' +
    'Для заказа поездки откройте Web App кнопкой ниже.'
  );
});

// Handle text messages
bot.on('text', async (ctx) => {
  const webAppUrl = process.env.WEB_APP_URL;
  
  await ctx.reply(
    'Используйте Web App для работы с сервисом:',
    {
      reply_markup: {
        keyboard: [[{ text: 'Открыть приложение', web_app: { url: webAppUrl } }]],
        resize_keyboard: true
      }
    }
  );
});

module.exports = { bot };
