const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');

// Get analytics for current user
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get or create analytics record
    let result = await pool.query(
      'SELECT * FROM analytics WHERE user_id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      // Create initial analytics
      result = await pool.query(
        `INSERT INTO analytics (user_id) VALUES ($1) RETURNING *`,
        [req.user.userId]
      );
    }
    
    // Get financial data
    const revenue = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE user_id = $1',
      [req.user.userId]
    );
    
    const expense = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expense WHERE user_id = $1',
      [req.user.userId]
    );
    
    // Get rating data
    const ratings = await pool.query(
      `SELECT AVG(rating_value) as avg_rating, COUNT(*) as total_ratings
       FROM ratings WHERE given_to = $1`,
      [req.user.userId]
    );
    
    // Get shipment data (for manufacturers and warehouses)
    const shipments = await pool.query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
              AVG(EXTRACT(EPOCH FROM (actual_date_delivered - expected_delivery_date))/86400) as avg_delay
       FROM shipments 
       WHERE manufacturer_id = $1 OR whm_id = $1`,
      [req.user.userId]
    );
    
    // Get order data
    const orders = await pool.query(
      `SELECT COUNT(*) as total,
              SUM(total_amount) as total_amount
       FROM orders 
       WHERE ordered_by = $1 OR delivered_by = $1`,
      [req.user.userId]
    );
    
    const analytics = {
      ...result.rows[0],
      total_revenue: parseFloat(revenue.rows[0].total),
      total_expense: parseFloat(expense.rows[0].total),
      profit: parseFloat(revenue.rows[0].total) - parseFloat(expense.rows[0].total),
      avg_rating: parseFloat(ratings.rows[0].avg_rating) || 0,
      total_ratings: parseInt(ratings.rows[0].total_ratings),
      total_shipments: parseInt(shipments.rows[0].total),
      delivered_shipments: parseInt(shipments.rows[0].delivered),
      avg_shipment_delay: parseFloat(shipments.rows[0].avg_delay) || 0,
      total_orders: parseInt(orders.rows[0].total),
      total_order_amount: parseFloat(orders.rows[0].total_amount) || 0
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get revenue history
router.get('/revenue', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM revenue 
       WHERE user_id = $1 
       ORDER BY revenue_update_date DESC 
       LIMIT 50`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get expense history
router.get('/expense', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM expense 
       WHERE user_id = $1 
       ORDER BY expense_update_date DESC 
       LIMIT 50`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment history
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, o.total_amount, o.order_date
       FROM payment p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.user_id = $1
       ORDER BY p.payment_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status
router.put('/payments/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE payment SET status = $1 
       WHERE payment_id = $2 AND user_id = $3 RETURNING *`,
      [status, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add manual expense
router.post('/expense', authenticateToken, async (req, res) => {
  const { amount, category } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO expense (user_id, amount, category, order_id)
       VALUES ($1, $2, $3, NULL) RETURNING *`,
      [req.user.userId, amount, category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update manual expense
router.put('/expense/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount, category } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE expense 
       SET amount = $1, category = $2, expense_update_date = NOW()
       WHERE expense_id = $3 AND user_id = $4 AND order_id IS NULL
       RETURNING *`,
      [amount, category, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found or cannot be edited (order-related expenses cannot be modified)' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete manual expense
router.delete('/expense/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM expense 
       WHERE expense_id = $1 AND user_id = $2 AND order_id IS NULL
       RETURNING *`,
      [id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found or cannot be deleted (order-related expenses cannot be deleted)' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;