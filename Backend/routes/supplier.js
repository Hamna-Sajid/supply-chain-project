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

// Custom middleware for case-insensitive role checking
const checkSupplierRole = (req, res, next) => {
  console.log('checkSupplierRole - user:', req.user);
  console.log('checkSupplierRole - role:', req.user?.role);

  if (!req.user || !req.user.role || !req.user.role.toLowerCase().includes('supplier')) {
    console.log('Access denied - role check failed');
    return res.status(403).json({ error: 'Access denied for this role' });
  }
  next();
};

// Add raw material
router.post('/materials', authenticateToken, checkSupplierRole, async (req, res) => {
  const { material_name, description, quantity_available, unit_price } = req.body;

  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .insert([{
        material_name,
        description,
        quantity_available,
        unit_price,
        supplier_id: req.user.userId
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: error.message || 'Failed to add material' });
  }
});

// Get supplier's materials
router.get('/materials', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('supplier_id', req.user.userId);

    if (error) throw error;

    res.json({ materials: data });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update material
router.put('/materials/:id', authenticateToken, checkSupplierRole, async (req, res) => {
  const { id } = req.params;
  const { material_name, description, quantity_available, unit_price } = req.body;

  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .update({
        material_name,
        description,
        quantity_available,
        unit_price
      })
      .eq('material_id', id)
      .eq('supplier_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// View orders for supplier
router.get('/orders', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_date,
        order_status,
        total_amount,
        users!orders_ordered_by_fkey(name),
        order_items(
          product_id,
          quantity, 
          unit_price
        )
      `)
      .eq('delivered_by', req.user.userId)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      throw error;
    }

    console.log('Orders data from DB:', JSON.stringify(data, null, 2));

    // Use total_amount from database, fallback to calculated total from order_items
    const ordersFormatted = await Promise.all((data || []).map(async (order) => {
      let total = order.total_amount || 0;

      // If total_amount is 0 or null, calculate from order_items
      if (!total && order.order_items && order.order_items.length > 0) {
        total = (order.order_items || []).reduce((sum, item) => {
          return sum + ((item.quantity || 0) * (item.unit_price || 0));
        }, 0);
      }

      // Format order items - try to get material/product names
      const formattedItems = await Promise.all((order.order_items || []).map(async (item) => {
        let itemName = 'Unknown Item';

        if (item.product_id) {
          // Try raw_materials table first
          const { data: materialData } = await supabase
            .from('raw_materials')
            .select('material_name')
            .eq('material_id', item.product_id)
            .single();

          if (materialData?.material_name) {
            itemName = materialData.material_name;
          } else {
            // Fallback to products table
            const { data: productData } = await supabase
              .from('products')
              .select('product_name')
              .eq('product_id', item.product_id)
              .single();

            if (productData?.product_name) {
              itemName = productData.product_name;
            }
          }
        }

        return {
          product_id: item.product_id,
          product_name: itemName,
          quantity: item.quantity,
          unit_price: item.unit_price
        };
      }));

      console.log(`Order ${order.order_id}: total_amount=${order.total_amount}, calculated=${total}`);

      return {
        order_id: order.order_id,
        order_date: order.order_date,
        order_status: order.order_status,
        manufacturer: order.users?.name || 'Unknown',
        order_items: formattedItems,
        total_amount: total
      };
    }));

    console.log('Formatted orders:', JSON.stringify(ordersFormatted, null, 2));
    res.json({ orders: ordersFormatted });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, checkSupplierRole, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Convert status to lowercase to match database constraint
    const normalizedStatus = status.toLowerCase();

    const { data, error } = await supabase
      .from('orders')
      .update({
        order_status: normalizedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', id)
      .eq('delivered_by', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ ...data, order_status: data.order_status });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier dashboard data
router.get('/dashboard', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Dashboard request for user:', userId);

    // Total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('delivered_by', userId)
      .eq('order_status', 'delivered');

    // Total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('expense')
      .select('amount')
      .eq('user_id', userId);

    console.log('Expense data:', expenseData);
    console.log('Expense error:', expenseError);

    // Average rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('given_to', userId);

    // Get all orders to count by status
    const { data: allOrdersData, error: allOrdersError } = await supabase
      .from('orders')
      .select('order_id, order_status')
      .eq('delivered_by', userId);

    if (revenueError || expenseError || ratingError || allOrdersError) {
      throw revenueError || expenseError || ratingError || allOrdersError;
    }

    const totalRevenue = (revenueData || []).reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const totalExpense = (expenseData || []).reduce((sum, item) => {
      const amount = item.amount;
      console.log('Processing expense amount:', amount, 'Type:', typeof amount);
      return sum + (parseFloat(amount) || 0);
    }, 0);
    const ratings = ratingData || [];
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, item) => sum + item.rating_value, 0) / ratings.length).toFixed(1)
      : 0;
    const totalRatings = ratings.length;

    // Count orders by status
    const orderStatusCounts = (allOrdersData || []).reduce((acc, order) => {
      const status = order.order_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const pendingCount = (orderStatusCounts['pending'] || 0) + (orderStatusCounts['processing'] || 0);
    const deliveredCount = orderStatusCounts['delivered'] || 0;
    const cancelledCount = orderStatusCounts['cancelled'] || 0;
    const totalOrders = (allOrdersData || []).length;

    console.log('Total expense calculated:', totalExpense);
    console.log('Order status counts:', orderStatusCounts);

    res.json({
      total_revenue: totalRevenue,
      total_expenses: totalExpense,
      net_profit: totalRevenue - totalExpense,
      average_rating: parseFloat(avgRating),
      total_ratings: totalRatings,
      pending_orders_count: pendingCount,
      delivered_orders_count: deliveredCount,
      cancelled_orders_count: cancelledCount,
      total_orders_count: totalOrders,
      order_status_breakdown: orderStatusCounts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier ratings
router.get('/ratings', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        users!ratings_given_by_fkey(name)
      `)
      .eq('given_to', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const ratings = data || [];
    const average = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length).toFixed(1)
      : 0;

    res.json({
      ratings,
      average: parseFloat(average),
      total: ratings.length
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get material stock overview
router.get('/materials/stock/overview', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    console.log(`Fetching materials for supplier: ${req.user.userId}`);

    const { data, error } = await supabase
      .from('raw_materials')
      .select('material_id, material_name, quantity_available')
      .eq('supplier_id', req.user.userId)
      .order('quantity_available', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Material stock error:', error);
      throw error;
    }

    console.log(`Found ${(data || []).length} materials for supplier ${req.user.userId}`);
    res.json({ materials: data || [] });
  } catch (error) {
    console.error('Material stock error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete material
router.delete('/materials/:id', authenticateToken, checkSupplierRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('material_id', id)
      .eq('supplier_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending orders
router.get('/orders/pending', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        total_amount,
        order_status,
        order_date,
        users!orders_ordered_by_fkey(name)
      `)
      .eq('delivered_by', req.user.userId)
      .in('order_status', ['pending', 'processing'])
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend expectations
    const orders = (data || []).map(order => ({
      id: order.order_id,
      manufacturer_name: order.users?.name || 'Unknown',
      total_amount: order.total_amount || 0,
      status: order.order_status
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Get pending orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ notifications: data || [] });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get revenue
router.get('/revenue', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('revenue')
      .select('*')
      .eq('user_id', req.user.userId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform created_at to date for frontend consistency
    const revenues = (data || []).map(rev => ({
      id: rev.id,
      amount: rev.amount,
      source: rev.source || 'Payment',  // Use source if it exists, otherwise use 'Payment'
      date: rev.created_at
    }));

    res.json({ revenue: revenues });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get expenses
router.get('/expenses', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expense')
      .select('*')
      .eq('user_id', req.user.userId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform expense_id to id and created_at to date for frontend consistency
    const expenses = (data || []).map(exp => ({
      id: exp.expense_id,
      amount: exp.amount,
      category: exp.category,
      date: exp.created_at
    }));

    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Add expense
router.post('/expenses', authenticateToken, checkSupplierRole, async (req, res) => {
  const { amount, category } = req.body;

  try {
    const { data, error } = await supabase
      .from('expense')
      .insert([{
        amount,
        category,
        user_id: req.user.userId
      }])
      .select()
      .single();

    if (error) throw error;

    // Map expense_id to id and created_at to date for frontend consistency
    const expense = {
      id: data.expense_id,
      amount: data.amount,
      category: data.category,
      date: data.created_at
    };

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: error.message || 'Failed to add expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authenticateToken, checkSupplierRole, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('expense')
      .delete()
      .eq('expense_id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier payment status for orders received
router.get('/payments', authenticateToken, checkSupplierRole, async (req, res) => {
  try {
    // First, get all orders for this supplier
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_date,
        order_status,
        total_amount,
        users!orders_ordered_by_fkey(name)
      `)
      .eq('delivered_by', req.user.userId)
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
      manufacturer: order.users?.name || 'Unknown',
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
    console.error('Get supplier payments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Record payment for supplier order
router.post('/payments', authenticateToken, checkSupplierRole, async (req, res) => {
  const { order_id, payment_amount, payment_status } = req.body;
  const validStatus = getValidStatus(payment_status);

  try {
    const { data, error } = await supabase
      .from('payment')
      .insert([{
        order_id,
        amount: payment_amount,
        status: validStatus || 'pending',
        payment_date: new Date().toISOString(),
        user_id: req.user.userId
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status for supplier
router.put('/payments/:payment_id/status', authenticateToken, checkSupplierRole, async (req, res) => {
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

    if (error) {
      console.error('Update payment error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update supplier payment error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;