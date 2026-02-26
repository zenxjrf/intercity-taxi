const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { pool } = require('../../database/connection');
const router = express.Router();

router.post('/verify', authTelegram, async (req, res) => {
  try {
    let driver = null;
    if (req.user.role === 'driver') {
      const driverQuery = await pool.query(
        'SELECT * FROM drivers WHERE user_id = $1',
        [req.user.id]
      );
      driver = driverQuery.rows[0] || null;
    }
    
    res.json({
      user: req.user,
      driver: driver
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
