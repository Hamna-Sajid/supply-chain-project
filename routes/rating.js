const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Submit rating
router.post('/', authenticateToken, async (req, res) => {
  const { order_id, rated_user_id, rating_value, review_text } = req.body;
  
  try {
    // Verify order exists and is delivered
    const orderCheck = await pool.query(
      `SELECT * FROM orders WHERE order_id = $1 AND order_status = 'delivered' 
       AND (ordered_by = $2 OR delivered_by = $2)`,
      [order_id, req.user.userId]
    );
    
    if (orderCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Order not found or not delivered' });
    }
    
    // Check if already rated
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE order_id = $1 AND given_by = $2',
      [order_id, req.user.userId]
    );
    
    if (existingRating.rows.length > 0) {
      return res.status(400).json({ error: 'Order already rated' });
    }
    
    const result = await pool.query(
      `INSERT INTO ratings (given_by, given_to, order_id, rating_value, review)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.userId, rated_user_id, order_id, rating_value, review_text]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as rater_name
       FROM ratings r
       JOIN users u ON r.given_by = u.user_id
       WHERE r.given_to = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId]
    );
    
    const avgResult = await pool.query(
      `SELECT AVG(rating_value) as avg_rating, COUNT(*) as total_ratings
       FROM ratings WHERE given_to = $1`,
      [userId]
    );
    
    res.json({
      ratings: result.rows,
      average: avgResult.rows[0].avg_rating || 0,
      total: avgResult.rows[0].total_ratings
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my ratings (ratings I gave)
router.get('/my-ratings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as rated_user_name
       FROM ratings r
       JOIN users u ON r.given_to = u.user_id
       WHERE r.given_by = $1
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings received
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as rater_name
       FROM ratings r
       JOIN users u ON r.given_by = u.user_id
       WHERE r.given_to = $1
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get received ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;