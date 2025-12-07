const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Browse all raw materials
router.get('/raw-materials', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rm.*, u.name as supplier_name, 
              COALESCE(AVG(r.rating_value), 0) as avg_rating,
              COUNT(r.rating_id) as rating_count
       FROM raw_materials rm
       JOIN users u ON rm.supplier_id = u.user_id
       LEFT JOIN ratings r ON r.given_to = u.user_id
       GROUP BY rm.material_id, u.name
       ORDER BY avg_rating DESC, rm.unit_price ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get raw materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place order for raw materials
router.post('/orders', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  const { supplier_id, items, shipping_address } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (ordered_by, delivered_by, shipping_address, order_status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [req.user.userId, supplier_id, shipping_address]
    );
    
    const orderId = orderResult.rows[0].order_id;
    
    // Add order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.material_id, item.quantity, item.unit_price]
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

// Create product
router.post('/products', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  const { product_name, category, size, color, cost_price, selling_price, production_stage } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO products (product_name, category, size, color, cost_price, selling_price, manufacturer_id, production_stage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [product_name, category, size, color, cost_price, selling_price, req.user.userId, production_stage]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get manufacturer's products
router.get('/products', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE manufacturer_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product stage
router.put('/products/:id/stage', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  const { id } = req.params;
  const { production_stage } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE products SET production_stage = $1 
       WHERE product_id = $2 AND manufacturer_id = $3 RETURNING *`,
      [production_stage, id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product stage error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to inventory
router.post('/inventory', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  const { product_id, quantity_available, cost_price, selling_price, reorder_level } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO inventory (product_id, user_id, quantity_available, cost_price, selling_price, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_id, req.user.userId, quantity_available, cost_price, selling_price, reorder_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View all warehouses
router.get('/warehouses', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.address, u.contact_number,
              COALESCE(AVG(r.rating_value), 0) as avg_rating,
              COUNT(r.rating_id) as rating_count
       FROM users u
       LEFT JOIN ratings r ON r.given_to = u.user_id
       WHERE u.role = 'warehouse_manager'
       GROUP BY u.user_id
       ORDER BY avg_rating DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create shipment to warehouse
router.post('/shipments', authenticateToken, authorizeRole('manufacturer'), async (req, res) => {
  const { warehouse_id, product_id, quantity, shipping_address, expected_delivery_date } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO shipments (manufacturer_id, whm_id, product_id, quantity, shipping_address, expected_delivery_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'preparing') RETURNING *`,
      [req.user.userId, warehouse_id, product_id, quantity, shipping_address, expected_delivery_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;