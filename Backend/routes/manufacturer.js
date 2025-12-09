const express = require('express');
const router = express.Router();
const supabase = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Map frontend status values to valid database status values
// Try multiple format possibilities since we don't know the exact constraint
const statusMapping = {
  // Try lowercase
  'pending': 'pending',
  'paid': 'paid',
  'unpaid': 'unpaid',
  'failed': 'failed',
  // Try uppercase
  'PENDING': 'PENDING',
  'PAID': 'PAID',
  'UNPAID': 'UNPAID',
  'FAILED': 'FAILED',
  // Try single letters
  'p': 'pending',
  'P': 'pending',
  // Fallback mappings
  'completed': 'paid',
  'partial': 'unpaid',
  'active': 'pending',
  'inactive': 'failed'
};

const getValidStatus = (status) => {
  if (!status) return 'pending';
  const mapped = statusMapping[status];
  if (mapped) {
    console.log('Status mapping:', status, '->', mapped);
    return mapped;
  }
  // If no mapping found, return as-is and let database validate
  console.log('No mapping found for status:', status, 'using as-is');
  return status.toLowerCase();
};

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
  const { product_name, production_stage } = req.body;

  console.log('Creating product - name:', product_name, 'stage:', production_stage, 'userId:', req.user.userId);

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        product_name,
        production_stage,
        manufacturer_id: req.user.userId,
        cost_price: 0,
        selling_price: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    console.log('Product created:', data);
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

// Update product production stage
router.put('/products/:id/stage', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { id } = req.params;
  const { production_stage } = req.body;

  if (!production_stage) {
    return res.status(400).json({ error: 'Production stage is required' });
  }

  try {
    // First, verify the product exists and belongs to this manufacturer
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', id)
      .eq('manufacturer_id', req.user.userId)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update only the production_stage field
    const { error: updateError } = await supabase
      .from('products')
      .update({ production_stage })
      .eq('product_id', id)
      .eq('manufacturer_id', req.user.userId);

    if (updateError) throw updateError;

    console.log('Product stage updated:', id, 'to', production_stage);
    res.json({ message: 'Production stage updated successfully', product: { ...product, production_stage } });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ error: error.message || 'Failed to update production stage' });
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

  console.log('Place order request:', { supplier_id, items, userId: req.user.userId });

  try {
    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'supplier_id and items are required' });
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ordered_by: req.user.userId,
        delivered_by: supplier_id,
        order_status: 'pending',
        order_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created:', orderData);

    // Add order items - try using material_id column if product_id doesn't work
    for (const item of items) {
      console.log('Adding item to order:', { order_id: orderData.order_id, item });
      
      // First, try to use material_id directly
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{
          order_id: orderData.order_id,
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }]);

      if (itemError) {
        console.error('Item insertion error:', itemError);
        console.error('Item data attempted:', { order_id: orderData.order_id, material_id: item.material_id, quantity: item.quantity, unit_price: item.unit_price });
        throw itemError;
      }
    }

    console.log('Order completed successfully');
    res.status(201).json({ 
      message: 'Order placed successfully',
      order: orderData 
    });
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
        order_id,
        order_date,
        order_status,
        total_amount,
        users!orders_delivered_by_fkey(name),
        order_items(
          product_id,
          quantity,
          unit_price,
          products(product_name)
        )
      `)
      .eq('ordered_by', req.user.userId)
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Use total_amount from database, fallback to calculated total from order_items
    const ordersFormatted = (data || []).map(order => {
      let total = order.total_amount || 0;
      
      // If total_amount is 0, calculate from order_items
      if (total === 0 && order.order_items && order.order_items.length > 0) {
        total = (order.order_items || []).reduce((sum, item) => {
          return sum + (item.quantity * item.unit_price);
        }, 0);
      }
      
      // Format order items with product and material names
      const formattedItems = (order.order_items || []).map(item => ({
        product_id: item.product_id,
        product_name: item.products?.product_name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      
      return {
        order_id: order.order_id,
        order_date: order.order_date,
        order_status: order.order_status,
        supplier: order.users?.name || 'Unknown',
        order_items: formattedItems,
        total_amount: total
      };
    });

    res.json({ orders: ordersFormatted });
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

// Get manufacturer payment status for orders
router.get('/payments', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    // First, get all orders for this manufacturer
    const { data: orders, error: orderError } = await supabase
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

    if (orderError) {
      console.error('Order fetch error:', orderError);
      throw orderError;
    }

    // Then, try to get payments (if payment table exists and has data)
    const { data: payments, error: paymentError } = await supabase
      .from('payment')
      .select('*')
      .in('order_id', (orders || []).map(o => o.order_id));

    console.log('Payments fetched:', payments);
    console.log('Payment error:', paymentError);

    // Create a map of payments by order_id for quick lookup
    const paymentMap = {};
    if (payments) {
      payments.forEach(p => {
        if (!paymentMap[p.order_id]) {
          paymentMap[p.order_id] = p;
        }
      });
    }

    // Format payments with order details
    const paymentData = (orders || []).map(order => ({
      order_id: order.order_id,
      supplier: order.users?.name || 'Unknown',
      order_date: order.order_date,
      order_status: order.order_status,
      order_total: order.total_amount,
      payment: paymentMap[order.order_id] ? {
        payment_id: paymentMap[order.order_id].payment_id,
        payment_date: paymentMap[order.order_id].payment_date,
        payment_status: paymentMap[order.order_id].status || 'pending',
        payment_amount: paymentMap[order.order_id].payment_amount || paymentMap[order.order_id].amount || order.total_amount || 0
      } : {
        payment_id: null,
        payment_date: null,
        payment_status: 'pending',
        payment_amount: order.total_amount || 0
      }
    }));

    res.json({ payments: paymentData });
  } catch (error) {
    console.error('Get manufacturer payments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update payment status for manufacturer
router.put('/payments/:payment_id/status', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { payment_id } = req.params;
  const { payment_status, order_id } = req.body;

  const validStatus = getValidStatus(payment_status);
  console.log('Update payment request - payment_id:', payment_id, 'payment_status:', payment_status, 'validStatus:', validStatus, 'order_id:', order_id);

  try {
    // If payment_id is null or 'null', we need to create a new payment
    if (!payment_id || payment_id === 'null') {
      if (!order_id) {
        return res.status(400).json({ error: 'order_id required for new payments' });
      }

      // Fetch the order to get the total amount
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('order_id', order_id)
        .single();

      if (orderError || !orderData) {
        console.error('Error fetching order:', orderError);
        return res.status(400).json({ error: 'Order not found' });
      }

      const paymentAmount = orderData.total_amount || 0;
      console.log('Creating new payment with status:', validStatus, 'amount:', paymentAmount);
      const { data, error } = await supabase
        .from('payment')
        .insert([{
          order_id,
          status: validStatus,
          payment_date: new Date().toISOString(),
          amount: paymentAmount,
          user_id: req.user.userId
        }])
        .select()
        .single();

      if (error) {
        console.error('Create payment error:', error);
        throw error;
      }

      return res.status(201).json(data);
    }

    // Otherwise, update existing payment
    const { data, error } = await supabase
      .from('payment')
      .update({ status: validStatus })
      .eq('payment_id', payment_id)
      .select()
      .single();

    console.log('Update response - data:', data);
    console.log('Update response - error:', error);

    if (error) {
      console.error('Update payment error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update manufacturer payment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;