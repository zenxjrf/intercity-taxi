const { validateInitData } = require('../../utils/validateInitData');
const { pool } = require('../../database/connection');

async function authTelegram(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  
  if (!initData) {
    return res.status(401).json({ error: 'No initData provided' });
  }
  
  const result = validateInitData(initData);
  
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }
  
  try {
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [result.user.id]
    );
    
    let user;
    if (userQuery.rows.length === 0) {
      const insertQuery = await pool.query(
        `INSERT INTO users (telegram_id, username, first_name, last_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [result.user.id, result.user.username, result.user.first_name, result.user.last_name]
      );
      user = insertQuery.rows[0];
    } else {
      user = userQuery.rows[0];
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authTelegram };
