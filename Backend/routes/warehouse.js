const express = require('express');
const router = express.Router();
const supabase = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Custom middleware for case-insensitive role checking
const checkWarehouseRole = (req, res, next) => {
  if (!req.user || !req.user.role || !req.user.role.toLowerCase().includes('warehouse')) {
    return res.status(403).json({ error: 'Access denied for this role' });
  }
  next();
};

// ============================================
// SHIPMENT MANAGEMENT (from manufacturers)
// ============================================

// Get incoming shipments for warehouse
router.get('/shipments', authenticateToken, checkWarehouseRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        shipment_id,
        quantity,
        status,
        expected_delivery_date,
        created_at,
        users!shipments_manufacturer_id_fkey(name)
      `)
      .eq('whm_id', req.user.userId)
      .order('expected_delivery_date', { ascending: true });

    if (error) throw error;

    // Map fields to match frontend expectations
    const mappedShipments = (data || []).map(s => ({
      id: s.shipment_id,
      manufacturer: s.users?.name || 'Unknown',
      expectedDate: s.expected_delivery_date,
      currentStatus: s.status.charAt(0).toUpperCase() + s.status.slice(1)
    }));

    console.log(`Fetched ${mappedShipments.length} shipments for warehouse ${req.user.userId}`);
    res.json(mappedShipments);
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept incoming shipment
router.put('/shipments/:id/accept', authenticateToken, checkWarehouseRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status: 'delivered' })
      .eq('shipment_id', id)
      .eq('whm_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ message: 'Shipment accepted and marked as delivered' });
  } catch (error) {
    console.error('Accept shipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject incoming shipment
router.put('/shipments/:id/reject', authenticateToken, checkWarehouseRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('shipment_id', id)
      .eq('whm_id', req.user.userId);

    if (error) throw error;

    res.json({ message: 'Shipment rejected and deleted' });
  } catch (error) {
    console.error('Reject shipment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// INVENTORY MANAGEMENT
// ============================================

// Get warehouse inventory
router.get('/inventory', authenticateToken, checkWarehouseRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        quantity_available,
        reorder_level,
        cost_price,
        selling_price,
        products(product_name, category)
      `)
      .eq('warehouse_id', req.user.userId)
      .order('quantity_available', { ascending: true });

    if (error) throw error;

    // Map fields to match frontend expectations
    const mappedInventory = (data || []).map(item => ({
      id: item.products?.product_name || 'Unknown',
      productName: item.products?.product_name || 'Unknown',
      currentStock: item.quantity_available,
      reorderLevel: item.reorder_level,
      category: item.products?.category || 'Unknown'
    }));

    res.json(mappedInventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock items
router.get('/inventory/low-stock', authenticateToken, checkWarehouseRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        quantity_available,
        reorder_level,
        products(product_name, category)
      `)
      .eq('warehouse_id', req.user.userId);

    if (error) throw error;

    // Filter items below reorder level
    const lowStockItems = (data || []).filter(item => item.quantity_available < item.reorder_level);

    // Map fields to match frontend expectations
    const mappedItems = lowStockItems.map(item => ({
      id: item.products?.product_name || 'Unknown',
      productName: item.products?.product_name || 'Unknown',
      currentStock: item.quantity_available,
      reorderLevel: item.reorder_level,
      category: item.products?.category || 'Unknown'
    }));

    res.json(mappedItems);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// ORDER FULFILLMENT (from retailers)
// ============================================

// Get orders pending fulfillment
router.get('/orders', authenticateToken, checkWarehouseRole, async (req, res) => {
  try {
    // Get orders that are pending or processing (warehouse fulfillment ready)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        total_amount,
        order_status,
        order_date,
        users!orders_ordered_by_fkey(name)
      `)
      .in('order_status', ['pending', 'processing'])
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Map fields and calculate item count
    const mappedOrders = (data || []).map(o => ({
      id: o.order_id,
      retailer: o.users?.name || 'Unknown',
      itemCount: 0,
      totalValue: o.total_amount,
      orderDate: o.order_date,
      status: o.order_status
    }));

    res.json({ orders: mappedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order fulfillment status
router.put('/orders/:id/status', authenticateToken, checkWarehouseRole, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        order_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', id)
      .eq('warehouse_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// DASHBOARD METRICS
// ============================================

// Get warehouse dashboard data
router.get('/dashboard', authenticateToken, checkWarehouseRole, async (req, res) => {
  try {
    console.log(`Fetching dashboard for warehouse: ${req.user.userId}`);

    // Get incoming shipments count
    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from('shipments')
      .select('shipment_id')
      .neq('status', 'accepted')
      .neq('status', 'rejected');

    // Get inventory value
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('quantity_available, cost_price');

    // Get pending orders count
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('order_id')
      .in('order_status', ['pending', 'processing']);

    if (shipmentsError || inventoryError || ordersError) {
      throw shipmentsError || inventoryError || ordersError;
    }

    const incomingShipments = (shipmentsData || []).length;
    const totalStockValue = (inventoryData || []).reduce((sum, item) => {
      return sum + ((item.quantity_available || 0) * (item.cost_price || 0));
    }, 0);
    const readyForShipment = (ordersData || []).length;

    res.json({
      incomingShipments,
      totalStockValue,
      readyForShipment
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;