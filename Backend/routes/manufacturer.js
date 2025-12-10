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
    // Get products in production (all except completed)
    const { data: productionData, error: prodError } = await supabase
      .from('products')
      .select('product_id, production_stage')
      .eq('manufacturer_id', req.user.userId)
      .neq('production_stage', 'completed');

    // Get finished goods (sum of inventory quantities)
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

    // Products in production (those not yet completed)
    const totalProduction = (productionData || []).length;

    // Finished goods stock (sum of all inventory quantities)
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

// Update product quantity (only when status is 'completed')
router.put('/products/:id/quantity', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  try {
    // Get the product and verify it's completed
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', id)
      .eq('manufacturer_id', req.user.userId)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.production_stage !== 'completed') {
      return res.status(400).json({ error: 'Quantity can only be added when production stage is completed' });
    }

    // Check if product is already in inventory
    const { data: existingInventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', id)
      .eq('user_id', req.user.userId)
      .single();

    let inventoryData;
    if (existingInventory) {
      // Update existing inventory
      const { data, error } = await supabase
        .from('inventory')
        .update({
          quantity_available: quantity,
          cost_price: product.cost_price,
          selling_price: product.selling_price
        })
        .eq('product_id', id)
        .eq('user_id', req.user.userId)
        .select()
        .single();

      if (error) throw error;
      inventoryData = data;
    } else {
      // Create new inventory entry
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          product_id: id,
          user_id: req.user.userId,
          quantity_available: quantity,
          cost_price: product.cost_price || 0,
          selling_price: product.selling_price || 0,
          reorder_level: 10
        }])
        .select()
        .single();

      if (error) throw error;
      inventoryData = data;
    }

    console.log('Product quantity added to inventory:', id, 'quantity:', quantity);
    res.json({ message: 'Quantity added to inventory successfully', inventory: inventoryData });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ error: error.message || 'Failed to update quantity' });
  }
});

// Update inventory cost price
router.put('/inventory/:id', authenticateToken, checkManufacturerRole, async (req, res) => {
  try {
    const { id } = req.params;
    const { cost_price, selling_price } = req.body;

    // At least one of cost_price or selling_price must be provided
    if ((cost_price === undefined || cost_price === null) && (selling_price === undefined || selling_price === null)) {
      return res.status(400).json({ error: 'cost_price or selling_price is required' });
    }

    // Validate cost_price if provided
    if (cost_price !== undefined && cost_price !== null) {
      if (isNaN(cost_price) || cost_price < 0) {
        return res.status(400).json({ error: 'cost_price must be a valid non-negative number' });
      }
    }

    // Validate selling_price if provided
    if (selling_price !== undefined && selling_price !== null) {
      if (isNaN(selling_price) || selling_price < 0) {
        return res.status(400).json({ error: 'selling_price must be a valid non-negative number' });
      }
    }

    // Verify inventory belongs to manufacturer
    const { data: inventoryData, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('inventory_id', id)
      .eq('user_id', req.user.userId)
      .single();

    if (fetchError || !inventoryData) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Build update object
    const updateObj = {};
    if (cost_price !== undefined && cost_price !== null) {
      updateObj.cost_price = cost_price;
    }
    if (selling_price !== undefined && selling_price !== null) {
      updateObj.selling_price = selling_price;
    }

    // Update the fields
    const { error } = await supabase
      .from('inventory')
      .update(updateObj)
      .eq('inventory_id', id)
      .eq('user_id', req.user.userId);

    if (error) throw error;

    console.log('Inventory updated:', id, 'changes:', updateObj);
    res.json({ message: 'Inventory updated successfully', inventory_id: id, ...updateObj });
  } catch (error) {
    console.error('Update inventory cost price error:', error);
    res.status(500).json({ error: error.message || 'Failed to update cost price' });
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
        whm_id: warehouse_id,
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

// Update shipment status (preparing, in_transit or delivered)
router.put('/shipments/:id/status', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  if (!['preparing', 'in_transit', 'delivered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Only preparing, in_transit, and delivered are allowed.' });
  }

  try {
    // Check if user is manufacturer for this shipment
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('*')
      .eq('shipment_id', id)
      .eq('manufacturer_id', userId)
      .single();

    if (fetchError || !shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const { data, error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('shipment_id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: `Shipment status updated to ${status}`, shipment: data });
  } catch (error) {
    console.error('Update shipment status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place order for raw materials
router.post('/orders', authenticateToken, checkManufacturerRole, async (req, res) => {
  const { supplier_id, items } = req.body;

  console.log('📦 Place order request:', { supplier_id, items, userId: req.user.userId });

  try {
    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'supplier_id and items are required' });
    }

    // Calculate total amount from items
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0));
    }, 0);

    console.log('💰 Calculated total amount:', totalAmount);

    // Create order with total_amount
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        ordered_by: req.user.userId,
        delivered_by: supplier_id,
        order_status: 'pending',
        order_date: new Date().toISOString(),
        total_amount: totalAmount
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      throw orderError;
    }

    console.log('✅ Order created:', orderData);

    // Automatically create a payment entry for this order
    // COMMENTED OUT: Payment entries are now managed through the /payments endpoint
    /*
    console.log('📝 Creating payment entry for order:', orderData.order_id);
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment')
      .insert([{
        order_id: orderData.order_id,
        paid_by: req.user.userId,    // Manufacturer making the payment
        paid_to: supplier_id,         // Supplier receiving the payment
        amount: totalAmount,
        status: 'pending',
        payment_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (paymentError) {
      console.error('⚠️ Warning: Failed to create payment entry:', paymentError);
      // Don't fail the order creation if payment creation fails
    } else {
      console.log('✅ Payment entry created:', paymentData);
    }
    */

    // Add order items
    if (!items || items.length === 0) {
      return res.status(201).json({
        message: 'Order placed successfully (no items)',
        order: orderData
      });
    }

    console.log('📋 Starting to insert', items.length, 'order items...');
    const insertedItems = [];
    let lastError = null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        console.log(`[Item ${i + 1}/${items.length}] Processing:`, {
          material_id: item.material_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        });

        const orderItemData = {
          order_id: orderData.order_id,
          product_id: item.material_id,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0
        };

        console.log(`[Item ${i + 1}] Payload:`, orderItemData);

        const { data: itemData, error: itemError } = await supabase
          .from('order_items')
          .insert([orderItemData])
          .select();

        if (itemError) {
          lastError = itemError;
          console.error(`[Item ${i + 1}] ❌ SUPABASE ERROR:`, {
            code: itemError.code,
            message: itemError.message,
            details: itemError.details,
            hint: itemError.hint,
            statusCode: itemError.statusCode
          });
          // Try to get more info about the table
          console.error('[Item', i + 1, '] Attempted to insert into order_items table');
          console.error('Order ID:', orderData.order_id, 'Type:', typeof orderData.order_id);
          console.error('Product ID:', item.material_id, 'Type:', typeof item.material_id);
          continue;
        }

        if (!itemData || itemData.length === 0) {
          console.warn(`[Item ${i + 1}] ⚠️ No data returned from insert (but no error)`, itemData);
          continue;
        }

        console.log(`[Item ${i + 1}]  Inserted successfully:`, itemData[0]);
        insertedItems.push(itemData[0]);
      } catch (error) {
        lastError = error;
        console.error(`[Item ${i + 1}] Exception:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Return success if at least one item was inserted
    if (insertedItems.length > 0) {
      console.log(`Order ${orderData.order_id} completed with ${insertedItems.length}/${items.length} items`);

      // Create notification for supplier
      try {
        const itemsText = insertedItems.map(item =>
          `${item.quantity}x ${item.product_id}`
        ).join(', ');

        await supabase
          .from('notifications')
          .insert([{
            user_id: supplier_id,
            type: 'New Order',
            description: `New order #${orderData.order_id} received with ${insertedItems.length} item(s): ${itemsText}. Total: $${totalAmount.toFixed(2)}`,
            is_read: false,
            created_at: new Date().toISOString()
          }]);
        console.log(' Notification created for supplier:', supplier_id);
      } catch (notifError) {
        console.error(' Warning: Failed to create notification:', notifError);
        // Don't fail the order if notification fails
      }

      return res.status(201).json({
        message: `Order placed successfully (${insertedItems.length} of ${items.length} items created)`,
        order: orderData,
        itemsCreated: insertedItems.length,
        note: insertedItems.length < items.length ? `Warning: ${items.length - insertedItems.length} items failed to insert` : undefined
      });
    }

    // If no items inserted and we have an error
    if (lastError) {
      console.error(`❌ Failed to insert any items for order ${orderData.order_id}`);
      console.error('Error code:', lastError.code);

      // Check for foreign key constraint violation
      if (lastError.code === '23503' || lastError.message?.includes('foreign key')) {
        return res.status(500).json({
          error: 'Failed to create order items',
          message: 'Foreign key constraint violated. The order_items table may have incorrect constraints. Please run SIMPLE_CREATE_ORDER_ITEMS.sql to recreate it.',
          code: lastError.code,
          hint: 'Run the DROP/CREATE SQL in SIMPLE_CREATE_ORDER_ITEMS.sql in Supabase SQL Editor',
          details: lastError.details
        });
      }

      // Check if it's a "relation does not exist" error
      if (lastError.code === 'PGRST301' || lastError.message?.includes('does not exist')) {
        return res.status(500).json({
          error: 'Failed to create order items',
          message: 'order_items table does not exist. See SIMPLE_CREATE_ORDER_ITEMS.sql to create it.',
          code: lastError.code,
          hint: 'Run the SQL in SIMPLE_CREATE_ORDER_ITEMS.sql in Supabase SQL Editor',
          details: lastError.details
        });
      }

      return res.status(500).json({
        error: 'Failed to create order items',
        message: lastError.message,
        code: lastError.code,
        hint: lastError.hint || 'Check database schema, permissions, and RLS policies',
        details: lastError.details
      });
    }

    res.status(500).json({
      error: 'Failed to create order items',
      message: 'No items could be inserted and no error was returned'
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
          order_item_id,
          product_id,
          quantity,
          unit_price,
          raw_materials(material_name)
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

      // Format order items - product_id stores the material_id
      const formattedItems = (order.order_items || []).map(item => ({
        order_item_id: item.order_item_id,
        product_id: item.product_id,  // This is the material_id
        product_name: item.raw_materials?.material_name || 'Unknown',
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
      .eq('paid_by', req.user.userId)
      .in('order_id', (orders || []).map(o => o.order_id));

    console.log('Payments fetched:', payments);
    console.log('Payment error:', paymentError);

    // Create a map of payments by order_id for quick lookup
    const paymentMap = {};
    if (payments) {
      payments.forEach(p => {
        // Always use the latest payment (last one in the list, or by created_at if available)
        paymentMap[p.order_id] = p;
      });
    }

    // Format payments with order details
    const paymentData = (orders || []).map(order => {
      const paymentInfo = paymentMap[order.order_id];

      return {
        order_id: order.order_id,
        supplier: order.users?.name || 'Unknown',
        order_date: order.order_date,
        order_status: order.order_status,
        order_total: order.total_amount,
        payment: paymentInfo ? {
          payment_id: paymentInfo.payment_id || null,
          payment_date: paymentInfo.payment_date,
          payment_status: paymentInfo.status || 'pending',
          payment_amount: order.total_amount
        } : {
          payment_id: null,
          payment_date: null,
          payment_status: 'pending',
          payment_amount: order.total_amount
        }
      };
    });

    console.log('Payment data prepared:', paymentData);
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