const express = require('express');
const { authTelegram } = require('../middlewares/authTelegram');
const { checkRole } = require('../middlewares/checkRole');
const { pool } = require('../../database/connection');
const router = express.Router();

// Get all prices (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prices WHERE is_active = TRUE ORDER BY city_from, city_to'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price for specific route (public)
router.get('/:cityFrom/:cityTo', async (req, res) => {
  try {
    const { cityFrom, cityTo } = req.params;
    const result = await pool.query(
      'SELECT * FROM prices WHERE city_from = $1 AND city_to = $2 AND is_active = TRUE',
      [cityFrom, cityTo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new route (admin only)
router.post('/', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const {
      city_from,
      city_to,
      trip_price_per_person,
      parcel_price_per_kg,
      parcel_min_price,
      car_transport_price,
      distance_km
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO prices (city_from, city_to, trip_price_per_person, parcel_price_per_kg, 
       parcel_min_price, car_transport_price, distance_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [city_from, city_to, trip_price_per_person, parcel_price_per_kg, 
       parcel_min_price, car_transport_price, distance_km]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update route (admin only)
router.put('/:id', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trip_price_per_person,
      parcel_price_per_kg,
      parcel_min_price,
      car_transport_price,
      distance_km,
      is_active
    } = req.body;
    
    const result = await pool.query(
      `UPDATE prices 
       SET trip_price_per_person = $1, parcel_price_per_kg = $2, parcel_min_price = $3,
           car_transport_price = $4, distance_km = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [trip_price_per_person, parcel_price_per_kg, parcel_min_price, 
       car_transport_price, distance_km, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete route (admin only)
router.delete('/:id', authTelegram, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM prices WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted' });
  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
