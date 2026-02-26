require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { bot } = require('./src/bot');
const { pool } = require('./src/database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.WEB_APP_URL, 'https://*.onrender.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Telegram-Init-Data', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
}

// Routes
app.use('/api/auth', require('./src/api/routes/auth.route'));
app.use('/api/prices', require('./src/api/routes/prices.route'));
app.use('/api/drivers', require('./src/api/routes/drivers.route'));
app.use('/api/orders', require('./src/api/routes/orders.route'));
app.use('/api/reviews', require('./src/api/routes/reviews.route'));
app.use('/api/stats', require('./src/api/routes/stats.route'));
app.use('/api/broadcast', require('./src/api/routes/broadcast.route'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook for Telegram bot
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Launch bot
    if (process.env.NODE_ENV === 'production') {
      await bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);
      console.log('Webhook set');
    } else {
      await bot.launch();
      console.log('Bot started in polling mode');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
