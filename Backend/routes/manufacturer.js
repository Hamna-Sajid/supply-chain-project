const express = require('express');
const router = express.Router();
const supabase = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Custom middleware to handle case-insensitive role checking
const checkManufacturerRole = (req, res, next) => {
  if (!req.user || !req.user.role || !req.user.role.toLowerCase().includes('manufacturer')) {
    return res.status(403).json({ error: 'Access denied for this role' });
  }
  next();
};

// Get dashboard KPIs
router.get('/dashboard', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    // Get total products created
    const { data: productionData, error: prodError } = await supabase
      .from('products')
      .select('product_id')
      .eq('manufacturer_id', req.user.userId);

    // Get total inventory
    const { data: inventoryData, error: invError } = await supabase
      .from('inventory')
      .select('quantity_available')
      .eq('user_id', req.user.userId);

    // Get total orders placed
    const { data: ordersData, error: ordError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('ordered_by', req.user.userId);

    // Get total shipments
    const { data: shipmentsData, error: shipError } = await supabase
      .from('shipments')
      .select('shipment_id')
      .eq('manufacturer_id', req.user.userId);

    if (prodError || invError || ordError || shipError) {
      throw prodError || invError || ordError || shipError;
    }

    const totalProduction = (productionData || []).length;
    const totalInventory = (inventoryData || []).reduce((sum, i) => sum + (i.quantity_available || 0), 0);
    const totalOrders = (ordersData || []).length;
    const totalShipments = (shipmentsData || []).length;

    res.json({
      totalProduction,
      totalInventory,
      totalOrders,
      totalShipments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Browse all raw materials
router.get('/raw-materials', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*');

    if (error) {
      console.error('Raw materials error:', error);
      throw error;
    }

    console.log('Raw materials found:', data?.length || 0);
    console.log('Raw materials sample:', JSON.stringify(data?.[0], null, 2));
    
    // Fetch supplier names for each material
    const materialsWithSuppliers = await Promise.all(
      (data || []).map(async (material) => {
        let supplierName = 'Unknown Supplier';
        
        // Try to get supplier from supplier_id if it exists
        if (material.supplier_id) {
          try {
            console.log(`Fetching supplier for ID: ${material.supplier_id}`);
            const { data: supplierData, error: supplierError } = await supabase
              .from('users')
              .select('name')
              .eq('user_id', material.supplier_id)
              .single();
            
            console.log(`Supplier lookup result:`, { supplierData, supplierError });
            
            if (!supplierError && supplierData?.name) {
              supplierName = supplierData.name;
              console.log(`Found supplier name: ${supplierName}`);
            } else if (supplierError) {
              console.error(`Error fetching supplier ${material.supplier_id}:`, supplierError);
            }
          } catch (e) {
            console.error('Supplier fetch exception:', e);
          }
        } else {
          console.log(`No supplier_id for material: ${material.material_name}`);
        }
        
        return {
          ...material,
          supplier_name: supplierName,
        };
      })
    );

    res.json(materialsWithSuppliers || []);
  } catch (error) {
    console.error('Get raw materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get products
router.get('/products', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('manufacturer_id', req.user.userId);

    if (error) throw error;

    res.json({ products: data || [] });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post('/products', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { product_name, sku, production_stage, quantity } = req.body;

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        product_name,
        sku,
        production_stage,
        quantity,
        manufacturer_id: req.user.userId
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', id)
      .eq('manufacturer_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get inventory
router.get('/inventory', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products(product_name)
      `)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    res.json({ inventory: data || [] });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to inventory
router.post('/inventory', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { product_id, quantity_available, cost_price, selling_price, reorder_level } = req.body;

  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        product_id,
        user_id: req.user.userId,
        quantity_available,
        cost_price,
        selling_price,
        reorder_level
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: error.message || 'Failed to add inventory' });
  }
});

// View all warehouses
router.get('/warehouses', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'warehouse_manager')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create shipment to warehouse
router.post('/shipments', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { warehouse_id, product_id, quantity, shipping_address, expected_delivery_date } = req.body;

  try {
    const { data, error } = await supabase
      .from('shipments')
      .insert([{
        manufacturer_id: req.user.userId,
        warehouse_id,
        product_id,
        quantity,
        shipping_address,
        expected_delivery_date,
        status: 'preparing'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create shipment' });
  }
});

// Get shipments
router.get('/shipments', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        products(product_name)
      `)
      .eq('manufacturer_id', req.user.userId);

    if (error) throw error;

    res.json({ shipments: data || [] });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place order for raw materials
router.post('/orders', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { supplier_id, items } = req.body;

  try {
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ordered_by: req.user.userId,
        delivered_by: supplier_id,
        order_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    for (const item of items) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderData.order_id,
          product_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }]);

      if (itemError) throw itemError;
    }

    res.status(201).json(orderData);
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: error.message || 'Failed to place order' });
  }
});

// Get orders
router.get('/orders', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!orders_delivered_by_fkey(name),
        order_items(*)
      `)
      .eq('ordered_by', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ orders: data || [] });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    // Get revenue data
    const { data: revenueData, error: revError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('ordered_by', req.user.userId)
      .eq('order_status', 'delivered');

    // Get expense data
    const { data: expenseData, error: expError } = await supabase
      .from('inventory')
      .select('cost_price, quantity_available')
      .eq('user_id', req.user.userId);

    if (revError || expError) {
      throw revError || expError;
    }

    // Calculate totals
    const totalRevenue = (revenueData || []).reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const totalExpense = (expenseData || []).reduce((sum, e) => sum + ((e.cost_price || 0) * (e.quantity_available || 0)), 0);

    res.json({
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      yearToDateRevenue: totalRevenue
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;