const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Browse products from all warehouses
router.get('/products', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.product_name, p.category, p.size, p.color,
              u.name as warehouse_name, u.address as warehouse_address,
              COALESCE(AVG(r.rating_value), 0) as warehouse_rating,
              COUNT(r.rating_id) as rating_count
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       JOIN users u ON i.warehouse_id = u.user_id
       LEFT JOIN ratings r ON r.given_to = u.user_id
       WHERE i.quantity_available > 0 AND u.role = 'warehouse_manager'
       GROUP BY i.inventory_id, p.product_name, p.category, p.size, p.color, u.name, u.address
       ORDER BY warehouse_rating DESC, i.selling_price ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place order
router.post('/orders', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { warehouse_id, items, shipping_address } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (ordered_by, delivered_by, shipping_address, order_status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [req.user.userId, warehouse_id, shipping_address]
    );
    
    const orderId = orderResult.rows[0].order_id;
    
    // Add order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// View orders
router.get('/orders', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as warehouse_name
       FROM orders o
       JOIN users u ON o.delivered_by = u.user_id
       WHERE o.ordered_by = $1
       ORDER BY o.order_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View order details
router.get('/orders/:id', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT oi.*, p.product_name, o.order_status, o.order_date
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.order_id = $1 AND o.ordered_by = $2`,
      [id, req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create return
router.post('/returns', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { order_id, product_id, quantity, reason } = req.body;
  
  try {
    // Get manufacturer from order
    const orderResult = await pool.query(
      `SELECT p.manufacturer_id FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1 AND oi.product_id = $2`,
      [order_id, product_id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    
    const result = await pool.query(
      `INSERT INTO returns (order_id, product_id, quantity, reason, returned_by, returned_to, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [order_id, product_id, quantity, reason, req.user.userId, orderResult.rows[0].manufacturer_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View returns
router.get('/returns', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.product_name
       FROM returns r
       JOIN products p ON r.product_id = p.product_id
       WHERE r.returned_by = $1
       ORDER BY r.return_date DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View inventory
router.get('/inventory', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.product_name, p.category
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE i.user_id = $1
       ORDER BY p.product_name`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a sale
router.post('/sales', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { items, sale_note } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create sale
    const saleResult = await client.query(
      `INSERT INTO sales (retailer_id, sale_note)
       VALUES ($1, $2) RETURNING *`,
      [req.user.userId, sale_note]
    );
    
    const saleId = saleResult.rows[0].sale_id;
    
    // Add sale items (triggers will handle inventory and revenue)
    for (const item of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price_per_unit)
         VALUES ($1, $2, $3, $4)`,
        [saleId, item.product_id, item.quantity, item.price_per_unit]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(saleResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Record sale error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    client.release();
  }
});

// Get sales history
router.get('/sales', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { start_date, end_date } = req.query;
  
  try {
    let query = `
      SELECT s.*, 
             COUNT(DISTINCT si.sale_item_id) as item_count
      FROM sales s
      LEFT JOIN sale_items si ON s.sale_id = si.sale_id
      WHERE s.retailer_id = $1
    `;
    const params = [req.user.userId];
    
    if (start_date) {
      params.push(start_date);
      query += ` AND s.sale_date >= $${params.length}`;
    }
    
    if (end_date) {
      params.push(end_date);
      query += ` AND s.sale_date <= $${params.length}`;
    }
    
    query += ` GROUP BY s.sale_id ORDER BY s.sale_date DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sale details
router.get('/sales/:id', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT si.*, p.product_name, p.category
       FROM sale_items si
       JOIN products p ON si.product_id = p.product_id
       JOIN sales s ON si.sale_id = s.sale_id
       WHERE si.sale_id = $1 AND s.retailer_id = $2`,
      [id, req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get sale details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sales summary
router.get('/sales-summary', authenticateToken, authorizeRole('retailer'), async (req, res) => {
  const { period } = req.query; // 'day', 'week', 'month'
  
  try {
    let dateFilter = '';
    
    if (period === 'day') {
      dateFilter = "AND s.sale_date >= CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    const result = await pool.query(
      `SELECT 
         COUNT(s.sale_id) as total_sales,
         COALESCE(SUM(s.total_amount), 0) as total_revenue,
         COALESCE(SUM(si.quantity * (si.price_per_unit - i.cost_price)), 0) as total_profit
       FROM sales s
       LEFT JOIN sale_items si ON s.sale_id = si.sale_id
       LEFT JOIN inventory i ON si.product_id = i.product_id AND i.user_id = s.retailer_id
       WHERE s.retailer_id = $1 ${dateFilter}`,
      [req.user.userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;