const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const router = express.Router();

// Get all orders (admin only)
router.get('/', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { status, order_type, city_from, city_to, date_from, date_to } = req.query;
    let query = `
      SELECT o.*, 
             u.first_name as client_first_name, u.phone as client_phone,
             d.full_name as driver_name, d.phone as driver_phone
      FROM orders o
      JOIN users u ON o.client_id = u.id
      LEFT JOIN drivers d ON o.driver_id = d.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }
    if (order_type) {
      query += ` AND o.order_type = $${paramIndex}`;
      values.push(order_type);
      paramIndex++;
    }
    if (city_from) {
      query += ` AND o.city_from = $${paramIndex}`;
      values.push(city_from);
      paramIndex++;
    }
    if (city_to) {
      query += ` AND o.city_to = $${paramIndex}`;
      values.push(city_to);
      paramIndex++;
    }
    if (date_from) {
      query += ` AND o.departure_date >= $${paramIndex}`;
      values.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      query += ` AND o.departure_date <= $${paramIndex}`;
      values.push(date_to);
      paramIndex++;
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my orders
router.get('/my', authTelegram, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query;
    let values = [];
    
    if (req.user.role === 'client') {
      query = `
        SELECT o.*, d.full_name as driver_name, d.phone as driver_phone, d.car_brand, d.car_model, d.car_number
        FROM orders o
        LEFT JOIN drivers d ON o.driver_id = d.id
        WHERE o.client_id = $1
      `;
      values.push(req.user.id);
    } else if (req.user.role === 'driver') {
      const driverQuery = await pool.query('SELECT id FROM drivers WHERE user_id = $1', [req.user.id]);
      if (driverQuery.rows.length === 0) {
        return res.json([]);
      }
      const driverId = driverQuery.rows[0].id;
      
      query = `
        SELECT o.*, u.first_name as client_first_name, u.phone as client_phone
        FROM orders o
        JOIN users u ON o.client_id = u.id
        WHERE o.driver_id = $1
      `;
      values.push(driverId);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (status && status !== 'all') {
      query += ' AND o.status = $2';
      values.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available orders for driver
router.get('/available', authTelegram, checkRole('driver'), async (req, res) => {
  try {
    const driverQuery = await pool.query(
      'SELECT * FROM drivers WHERE user_id = $1 AND is_approved = TRUE AND is_blocked = FALSE',
      [req.user.id]
    );
    
    if (driverQuery.rows.length === 0) {
      return res.status(403).json({ error: 'Driver not found or not approved' });
    }
    
    const driver = driverQuery.rows[0];
    const workingRoutes = driver.working_routes || [];
    
    let query = `
      SELECT o.*, u.first_name as client_first_name
      FROM orders o
      JOIN users u ON o.client_id = u.id
      WHERE o.status = 'pending' 
      AND (o.order_type != 'car_transport' OR $1 = TRUE)
    `;
    
    const values = [driver.can_transport_car];
    
    if (workingRoutes.length > 0) {
      const routeConditions = workingRoutes.map((_, index) => 
        `(o.city_from = $${index * 2 + 2} AND o.city_to = $${index * 2 + 3})`
      ).join(' OR ');
      
      query += ` AND (${routeConditions})`;
      workingRoutes.forEach(route => {
        values.push(route.from, route.to);
      });
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by ID
router.get('/:id', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT o.*, 
              u.first_name as client_first_name, u.last_name as client_last_name, u.phone as client_phone,
              d.full_name as driver_name, d.phone as driver_phone, d.car_brand, d.car_model, 
              d.car_number, d.photo_url as driver_photo
       FROM orders o
       JOIN users u ON o.client_id = u.id
       LEFT JOIN drivers d ON o.driver_id = d.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = result.rows[0];
    
    // Check permissions
    if (req.user.role === 'client' && order.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'driver') {
      const driverQuery = await pool.query('SELECT id FROM drivers WHERE user_id = $1', [req.user.id]);
      if (driverQuery.rows.length === 0 || 
          (order.driver_id && driverQuery.rows[0].id !== order.driver_id)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order (client only)
router.post('/', authTelegram, checkRole('client'), async (req, res) => {
  try {
    const {
      order_type,
      city_from,
      city_to,
      pickup_address,
      dropoff_address,
      departure_date,
      departure_time,
      passengers_count,
      parcel_weight,
      parcel_description,
      recipient_name,
      recipient_phone,
      client_car_brand,
      client_car_model,
      client_car_year,
      client_car_number,
      comment,
      calculated_price,
      phone
    } = req.body;
    
    // Update user phone if provided
    if (phone) {
      await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [phone, req.user.id]);
    }
    
    const result = await pool.query(
      `INSERT INTO orders (client_id, order_type, city_from, city_to, pickup_address, dropoff_address,
       departure_date, departure_time, passengers_count, parcel_weight, parcel_description,
       recipient_name, recipient_phone, client_car_brand, client_car_model, client_car_year,
       client_car_number, comment, calculated_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [req.user.id, order_type, city_from, city_to, pickup_address, dropoff_address,
       departure_date, departure_time, passengers_count, parcel_weight, parcel_description,
       recipient_name, recipient_phone, client_car_brand, client_car_model, client_car_year,
       client_car_number, comment, calculated_price]
    );
    
    const order = result.rows[0];
    
    // Add to history
    await pool.query(
      'INSERT INTO order_status_history (order_id, new_status, changed_by) VALUES ($1, $2, $3)',
      [order.id, 'pending', req.user.telegram_id]
    );
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept order (driver only)
router.patch('/:id/accept', authTelegram, checkRole('driver'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const driverQuery = await pool.query('SELECT id FROM drivers WHERE user_id = $1', [req.user.id]);
    if (driverQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    const driverId = driverQuery.rows[0].id;
    
    // Check if order is still pending
    const orderCheck = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (orderCheck.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Order is no longer available' });
    }
    
    const result = await pool.query(
      `UPDATE orders SET driver_id = $1, status = 'accepted', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [driverId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order already taken' });
    }
    
    // Add to history
    await pool.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
      [id, 'pending', 'accepted', req.user.telegram_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.patch('/:id/status', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validTransitions = {
      'accepted': ['driver_on_way'],
      'driver_on_way': ['in_progress'],
      'in_progress': ['completed']
    };
    
    const orderQuery = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderQuery.rows[0];
    
    // Check permissions
    if (req.user.role === 'driver') {
      const driverQuery = await pool.query('SELECT id FROM drivers WHERE user_id = $1', [req.user.id]);
      if (driverQuery.rows.length === 0 || driverQuery.rows[0].id !== order.driver_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Drivers can only move forward in the flow
      if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
        return res.status(400).json({ error: 'Invalid status transition' });
      }
    } else if (req.user.role === 'admin') {
      // Admins can set any status
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    // Add to history
    await pool.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
      [id, order.status, status, req.user.telegram_id]
    );
    
    // If completed, increment driver trips
    if (status === 'completed' && order.driver_id) {
      await pool.query(
        'UPDATE drivers SET total_trips = total_trips + 1 WHERE id = $1',
        [order.driver_id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.patch('/:id/cancel', authTelegram, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const orderQuery = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderQuery.rows[0];
    
    // Check permissions
    if (req.user.role === 'client' && order.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'driver') {
      const driverQuery = await pool.query('SELECT id FROM drivers WHERE user_id = $1', [req.user.id]);
      if (driverQuery.rows.length === 0 || driverQuery.rows[0].id !== order.driver_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Increment cancelled orders count for driver
      await pool.query(
        'UPDATE drivers SET cancelled_orders = cancelled_orders + 1 WHERE id = $1',
        [order.driver_id]
      );
    }
    
    if (['completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled order' });
    }
    
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled', cancel_reason = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [reason, id]
    );
    
    // Add to history
    await pool.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, comment) VALUES ($1, $2, $3, $4, $5)',
      [id, order.status, 'cancelled', req.user.telegram_id, reason]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
