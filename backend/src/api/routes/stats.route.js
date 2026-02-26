const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const router = express.Router();

// Get overview stats (admin only)
router.get('/overview', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter;
    switch (period) {
      case 'today':
        dateFilter = "DATE_TRUNC('day', o.created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "o.created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "o.created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        dateFilter = "1=1";
    }
    
    const ordersQuery = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE order_type = 'trip') as trips,
        COUNT(*) FILTER (WHERE order_type = 'parcel') as parcels,
        COUNT(*) FILTER (WHERE order_type = 'car_transport') as car_transports,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COALESCE(SUM(calculated_price) FILTER (WHERE status = 'completed'), 0) as total_revenue
       FROM orders o
       WHERE ${dateFilter}`
    );
    
    const driversQuery = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_online = TRUE) as online,
        COUNT(*) FILTER (WHERE is_approved = TRUE) as approved,
        COUNT(*) FILTER (WHERE is_blocked = TRUE) as blocked
       FROM drivers`
    );
    
    res.json({
      orders: ordersQuery.rows[0],
      drivers: driversQuery.rows[0],
      period
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver stats (admin only)
router.get('/drivers', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        d.id, d.full_name, d.rating, d.total_trips, d.cancelled_orders,
        COUNT(o.id) FILTER (WHERE o.status = 'completed') as completed_orders,
        COALESCE(SUM(o.calculated_price) FILTER (WHERE o.status = 'completed'), 0) as total_earnings
       FROM drivers d
       LEFT JOIN orders o ON o.driver_id = d.id
       GROUP BY d.id, d.full_name, d.rating, d.total_trips, d.cancelled_orders
       ORDER BY completed_orders DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get route stats (admin only)
router.get('/routes', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        city_from, city_to,
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COALESCE(SUM(calculated_price) FILTER (WHERE status = 'completed'), 0) as total_revenue
       FROM orders
       GROUP BY city_from, city_to
       ORDER BY total_orders DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get route stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get daily orders chart (admin only)
router.get('/chart', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY date`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get chart stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
