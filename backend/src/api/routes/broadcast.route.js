const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const { bot } = require('../../bot');
const router = express.Router();

// Send broadcast message (admin only)
router.post('/', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { message, audience = 'all' } = req.body;
    
    let userQuery;
    switch (audience) {
      case 'clients':
        userQuery = await pool.query(
          "SELECT telegram_id FROM users WHERE role = 'client' AND is_blocked = FALSE"
        );
        break;
      case 'drivers':
        userQuery = await pool.query(
          "SELECT telegram_id FROM users WHERE role = 'driver' AND is_blocked = FALSE"
        );
        break;
      case 'online_drivers':
        userQuery = await pool.query(
          `SELECT u.telegram_id 
           FROM users u
           JOIN drivers d ON u.id = d.user_id
           WHERE d.is_online = TRUE AND u.is_blocked = FALSE`
        );
        break;
      default:
        userQuery = await pool.query(
          "SELECT telegram_id FROM users WHERE is_blocked = FALSE"
        );
    }
    
    const users = userQuery.rows;
    const results = {
      total: users.length,
      sent: 0,
      failed: 0
    };
    
    // Rate limiting: max 30 messages per second
    const MAX_PER_SECOND = parseInt(process.env.MAX_BROADCAST_PER_SECOND) || 25;
    const delay = 1000 / MAX_PER_SECOND;
    
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegram_id, message, { parse_mode: 'HTML' });
        results.sent++;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error(`Failed to send message to ${user.telegram_id}:`, error.message);
        results.failed++;
      }
    }
    
    res.json({
      success: true,
      message: 'Broadcast completed',
      results
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
