const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const router = express.Router();

// Get online drivers count (public)
router.get('/online/count', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM drivers WHERE is_online = TRUE AND is_approved = TRUE AND is_blocked = FALSE'
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get online count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get online drivers (public)
router.get('/online', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.username 
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.is_online = TRUE AND d.is_approved = TRUE AND d.is_blocked = FALSE
       ORDER BY d.rating DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get online drivers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all drivers (admin only)
router.get('/', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.last_name, u.username, u.telegram_id, u.phone as user_phone
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver by ID
router.get('/:id', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Drivers can only view their own profile unless they're admin
    if (req.user.role === 'driver') {
      const driverCheck = await pool.query(
        'SELECT id FROM drivers WHERE user_id = $1',
        [req.user.id]
      );
      if (driverCheck.rows.length === 0 || driverCheck.rows[0].id !== parseInt(id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.last_name, u.username, u.telegram_id, u.phone as user_phone
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new driver (admin only)
router.post('/', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const {
      telegram_id,
      full_name,
      birth_year,
      experience_years,
      phone,
      car_brand,
      car_model,
      car_year,
      car_color,
      car_number,
      car_seats,
      can_transport_car,
      working_routes
    } = req.body;
    
    // Update user role to driver
    await pool.query(
      'UPDATE users SET role = $1 WHERE telegram_id = $2',
      ['driver', telegram_id]
    );
    
    const userQuery = await pool.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [telegram_id]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userQuery.rows[0].id;
    
    const result = await pool.query(
      `INSERT INTO drivers (user_id, full_name, birth_year, experience_years, phone, 
       car_brand, car_model, car_year, car_color, car_number, car_seats, 
       can_transport_car, working_routes, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
       RETURNING *`,
      [userId, full_name, birth_year, experience_years, phone, car_brand, car_model, 
       car_year, car_color, car_number, car_seats, can_transport_car, 
       JSON.stringify(working_routes || [])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update driver profile
router.put('/:id', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (req.user.role === 'driver') {
      const driverCheck = await pool.query(
        'SELECT id FROM drivers WHERE user_id = $1',
        [req.user.id]
      );
      if (driverCheck.rows.length === 0 || driverCheck.rows[0].id !== parseInt(id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const isAdmin = req.user.role === 'admin';
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    // Drivers can only update: photo_url, phone, working_routes
    // Admins can update all fields
    const allowedFields = isAdmin ? 
      ['full_name', 'birth_year', 'experience_years', 'phone', 'photo_url', 
       'car_brand', 'car_model', 'car_year', 'car_color', 'car_number', 
       'car_seats', 'car_photo_url', 'can_transport_car', 'working_routes'] :
      ['phone', 'photo_url', 'working_routes'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(field === 'working_routes' ? JSON.stringify(req.body[field]) : req.body[field]);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE drivers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle online status (driver only)
router.patch('/:id/status', authTelegram, checkRole('driver'), async (req, res) => {
  try {
    const { id } = req.params;
    const driverCheck = await pool.query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );
    
    if (driverCheck.rows.length === 0 || driverCheck.rows[0].id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(
      `UPDATE drivers 
       SET is_online = NOT is_online, last_online_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block/Unblock driver (admin only)
router.patch('/:id/block', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;
    
    const result = await pool.query(
      'UPDATE drivers SET is_blocked = $1 WHERE id = $2 RETURNING *',
      [is_blocked, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Block driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
