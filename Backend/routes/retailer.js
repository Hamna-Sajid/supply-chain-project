const express = require('express');
const router = express.Router();
const supabase = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Custom middleware for case-insensitive role checking
const checkRetailerRole = (req, res, next) => {
  if (!req.user || !req.user.role || !req.user.role.toLowerCase().includes('retailer')) {
    return res.status(403).json({ error: 'Access denied for this role' });
  }
  next();
};

// Get dashboard data
router.get('/dashboard', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    console.log(`Fetching dashboard for retailer: ${req.user.userId}`);

    let todaysSalesRevenue = 0;
    let totalProfit = 0;
    let lowStockCount = 0;
    let pendingReturnsCount = 0;

    // Get today's sales revenue - safely
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('retailer_id', req.user.userId)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if (!salesError && salesData && salesData.length > 0) {
        todaysSalesRevenue = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      }
    } catch (e) {
      console.log('Sales fetch warning:', e.message);
    }

    // Get total profit - safely
    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue')
        .select('amount')
        .eq('retailer_id', req.user.userId);

      if (!revenueError && revenueData) {
        totalProfit = revenueData.reduce((sum, item) => sum + (item.amount || 0), 0);
      }
    } catch (e) {
      console.log('Revenue fetch warning:', e.message);
    }

    // Get low stock items - safely
    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('quantity_available, reorder_level')
        .eq('user_id', req.user.userId);

      if (!inventoryError && inventoryData) {
        lowStockCount = inventoryData.filter(
          item => item.quantity_available <= (item.reorder_level || 0)
        ).length;
      }
    } catch (e) {
      console.log('Inventory fetch warning:', e.message);
    }

    // Get pending returns - safely
    try {
      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select('*')
        .eq('returned_by', req.user.userId)
        .eq('status', 'pending');

      if (!returnsError && returnsData) {
        pendingReturnsCount = returnsData.length;
      }
    } catch (e) {
      console.log('Returns fetch warning:', e.message);
    }

    res.json({
      todaysSalesRevenue: Math.round(todaysSalesRevenue),
      totalProfit: Math.round(totalProfit),
      lowStockItems: lowStockCount,
      pendingReturns: pendingReturnsCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Browse products from all warehouses
router.get('/products', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    // Get products from inventory table with product details
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        product_id,
        quantity_available,
        products(product_id, product_name, category, selling_price)
      `)
      .gt('quantity_available', 0)
      .order('products(product_name)', { ascending: true });

    if (error) throw error;

    // Map to products format
    const products = (data || []).map(item => ({
      product_id: item.product_id,
      product_name: item.products?.product_name || 'Unknown',
      category: item.products?.category || '',
      sku: item.product_id || '',
      quantity: item.quantity_available,
      price: item.products?.selling_price || 0
    }));

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place order
router.post('/orders', authenticateToken, checkRetailerRole, async (req, res) => {
  const { warehouseId, items, shippingAddress } = req.body;

  try {
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ordered_by: req.user.userId,
        delivered_by: warehouseId,
        shipping_address: shippingAddress,
        order_status: 'pending',
        total_amount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.order_id;

    // Add order items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    res.status(201).json({
      id: orderId,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View orders
router.get('/orders', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_date,
        order_status,
        total_amount,
        users!orders_delivered_by_fkey(name)
      `)
      .eq('ordered_by', req.user.userId)
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Map fields for frontend
    const mappedOrders = (data || []).map(order => ({
      id: order.order_id,
      date: order.order_date,
      status: order.order_status,
      supplier: order.users?.name || 'Unknown',
      total: order.total_amount
    }));

    res.json({ orders: mappedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View order details
router.get('/orders/:id', authenticateToken, checkRetailerRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        order_item_id,
        quantity,
        unit_price,
        products(product_name, category, sku),
        orders(order_status, order_date)
      `)
      .eq('order_id', id)
      .eq('orders.ordered_by', req.user.userId);

    if (error) throw error;

    res.json({ items: data || [] });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create return
router.post('/returns', authenticateToken, checkRetailerRole, async (req, res) => {
  const { orderId, productId, quantity, reason } = req.body;

  try {
    const { data, error } = await supabase
      .from('returns')
      .insert([{
        order_id: orderId,
        product_id: productId,
        quantity: quantity,
        reason: reason,
        returned_by: req.user.userId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: data.return_id,
      message: 'Return request created successfully'
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View returns
router.get('/returns', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('returns')
      .select(`
        return_id,
        order_id,
        quantity,
        reason,
        status,
        return_date,
        products(product_name)
      `)
      .eq('returned_by', req.user.userId)
      .order('return_date', { ascending: false });

    if (error) throw error;

    // Map fields for frontend
    const mappedReturns = (data || []).map(ret => ({
      id: ret.return_id,
      orderId: ret.order_id,
      productName: ret.products?.product_name || 'Unknown',
      quantity: ret.quantity,
      reason: ret.reason,
      status: ret.status,
      date: ret.return_date
    }));

    res.json({ returns: mappedReturns });
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View inventory
router.get('/inventory', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        product_id,
        quantity_available,
        reorder_level,
        cost_price,
        selling_price,
        products(product_id, product_name, category, sku)
      `)
      .eq('user_id', req.user.userId);

    if (error) {
      console.error('Inventory fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }

    // Map fields for frontend
    const mappedInventory = (data || []).map(item => ({
      id: item.inventory_id,
      product_id: item.product_id,
      product_name: item.products?.product_name || 'Unknown Product',
      category: item.products?.category || '',
      sku: item.products?.sku || '',
      quantity_available: item.quantity_available || 0,
      reorder_level: item.reorder_level || 0,
      cost_price: item.cost_price || 0,
      selling_price: item.selling_price || 0,
      status: item.quantity_available <= (item.reorder_level || 0) ? 'Low Stock' : 'In Stock'
    }));

    res.json({ inventory: mappedInventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Record a sale
router.post('/sales', authenticateToken, checkRetailerRole, async (req, res) => {
  const { items, saleNote } = req.body;

  try {
    // Validate items have required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Create sale
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{
        retailer_id: req.user.userId,
        sale_note: saleNote || ''
      }])
      .select()
      .single();

    if (saleError) {
      console.error('Sale creation error:', saleError);
      throw saleError;
    }

    const saleId = saleData.sale_id;

    // Add sale items
    const saleItems = items.map(item => ({
      sale_id: saleId,
      product_id: item.product_id || item.productId,
      quantity: item.quantity,
      price_per_unit: item.price || item.pricePerUnit || 0
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error('Sale items error:', itemsError);
      throw itemsError;
    }

    res.status(201).json({
      id: saleId,
      message: 'Sale recorded successfully'
    });
  } catch (error) {
    console.error('Record sale error:', error);

    // Provide more specific error message
    if (error.message && error.message.includes('Inventory row not found')) {
      res.status(400).json({ error: 'Product not available in inventory' });
    } else {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
});

// Get sales
router.get('/sales', authenticateToken, checkRetailerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        sale_id,
        created_at,
        sale_note,
        sale_items(
          product_id,
          quantity,
          price_per_unit,
          products(product_name, category)
        )
      `)
      .eq('retailer_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map fields for frontend
    const mappedSales = (data || []).map(sale => ({
      id: sale.sale_id,
      date: sale.created_at,
      note: sale.sale_note,
      items: (sale.sale_items || []).map(item => ({
        productId: item.product_id,
        productName: item.products?.product_name,
        category: item.products?.category,
        quantity: item.quantity,
        pricePerUnit: item.price_per_unit,
        total: item.quantity * item.price_per_unit
      })),
      total: (sale.sale_items || []).reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    }));

    res.json({ sales: mappedSales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;