const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Add raw material
router.post('/materials', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  const { material_name, description, quantity_available, unit_price } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO raw_materials (material_name, description, quantity_available, unit_price, supplier_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [material_name, description, quantity_available, unit_price, req.user.userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier's materials
router.get('/materials', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM raw_materials WHERE supplier_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update material
router.put('/materials/:id', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  const { id } = req.params;
  const { material_name, description, quantity_available, unit_price } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE raw_materials 
       SET material_name = $1, description = $2, quantity_available = $3, unit_price = $4
       WHERE material_id = $5 AND supplier_id = $6 RETURNING *`,
      [material_name, description, quantity_available, unit_price, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View orders for supplier
router.get('/orders', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as ordered_by_name, oi.product_id, oi.quantity, oi.unit_price
       FROM orders o
       JOIN users u ON o.ordered_by = u.user_id
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       WHERE o.delivered_by = $1
       ORDER BY o.order_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE orders SET order_status = $1, updated_at = NOW()
       WHERE order_id = $2 AND delivered_by = $3 RETURNING *`,
      [status, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;