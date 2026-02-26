const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const router = express.Router();

// Create review (client only)
router.post('/', authTelegram, checkRole('client'), async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    
    // Check if order belongs to client and is completed
    const orderQuery = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND client_id = $2 AND status = $3',
      [order_id, req.user.id, 'completed']
    );
    
    if (orderQuery.rows.length === 0) {
      return res.status(400).json({ error: 'Order not found, not yours, or not completed' });
    }
    
    const order = orderQuery.rows[0];
    
    if (!order.driver_id) {
      return res.status(400).json({ error: 'No driver assigned to this order' });
    }
    
    // Check if already reviewed
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE order_id = $1',
      [order_id]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Order already reviewed' });
    }
    
    const result = await pool.query(
      `INSERT INTO reviews (order_id, client_id, driver_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, req.user.id, order.driver_id, rating, comment]
    );
    
    // Update driver rating
    const ratingQuery = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE driver_id = $1',
      [order.driver_id]
    );
    
    await pool.query(
      'UPDATE drivers SET rating = $1 WHERE id = $2',
      [ratingQuery.rows[0].avg_rating, order.driver_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for driver
router.get('/driver/:id', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT r.*, u.first_name as client_first_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.driver_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
