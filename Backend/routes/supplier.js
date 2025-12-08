const express = require('express');
const router = express.Router();
const supabase = require('../../config/database');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// Add raw material
router.post('/materials', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.get('/materials', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.put('/materials/:id', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.get('/orders', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!orders_ordered_by_fkey(name),
        order_items(product_id, quantity, unit_price)
      `)
      .eq('delivered_by', req.user.userId)
      .order('order_date', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
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
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        order_status: status,
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
    
    res.json(data);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier dashboard data
router.get('/dashboard', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    // Total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('delivered_by', req.user.userId)
      .eq('order_status', 'delivered');

    // Total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('expense')
      .select('amount')
      .eq('user_id', req.user.userId);

    // Average rating
    const { data: ratingData, error: ratingError } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('given_to', req.user.userId);

    // Pending orders count
    const { data: pendingData, error: pendingError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('delivered_by', req.user.userId)
      .neq('order_status', 'delivered');

    if (revenueError || expenseError || ratingError || pendingError) {
      throw revenueError || expenseError || ratingError || pendingError;
    }

    const totalRevenue = (revenueData || []).reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const totalExpense = (expenseData || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const ratings = ratingData || [];
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((sum, item) => sum + item.rating_value, 0) / ratings.length).toFixed(1)
      : 0;
    const totalRatings = ratings.length;
    const pendingCount = (pendingData || []).length;

    res.json({
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      avgRating: parseFloat(avgRating),
      totalRatings,
      pendingOrders: pendingCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supplier ratings
router.get('/ratings', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.get('/materials/stock/overview', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('material_name, quantity_available')
      .eq('supplier_id', req.user.userId)
      .order('quantity_available', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Material stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete material
router.delete('/materials/:id', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.get('/orders/pending', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
    
    res.json(data);
  } catch (error) {
    console.error('Get pending orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, authorizeRole('supplier'), async (req, res) => {
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
router.get('/revenue', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('revenue')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ revenue: data || [] });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get expenses
router.get('/expenses', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expense')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ expenses: data || [] });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add expense
router.post('/expenses', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  const { amount, category, description } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('expense')
      .insert([{
        amount,
        category,
        description,
        user_id: req.user.userId
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: error.message || 'Failed to add expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authenticateToken, authorizeRole('supplier'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('expense')
      .delete()
      .eq('id', id)
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

module.exports = router;