# Payment Table Refactoring - All Required Changes

## Database Schema Changes
Migration file: `supabase/migrations/20251210_refactor_payment_table.sql`

### Old Structure:
- `payment_id` (UUID, PK)
- `order_id` (UUID, FK to orders)
- `user_id` (UUID) - who receives the payment (supplier)
- `amount` (numeric)
- `status` (text)
- `payment_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### New Structure:
- `payment_id` (UUID, PK)
- `order_id` (UUID, FK to orders)
- `paid_by` (UUID, FK to users) - **NEW** - manufacturer who makes payment
- `paid_to` (UUID, FK to users) - **RENAMED** from `user_id` - supplier who receives payment
- `amount` (numeric(12,2))
- `status` (text)
- `payment_date` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Indexes Created:
- idx_payment_paid_to
- idx_payment_paid_by
- idx_payment_order_id
- idx_payment_status

---

## Backend Code Changes Required

### 1. Backend/routes/manufacturer.js - POST /orders endpoint (Line ~610)

**CHANGE FROM:**
```javascript
const { data: paymentData, error: paymentError } = await supabase
  .from('payment')
  .insert([{
    order_id: orderData.order_id,
    user_id: supplier_id,  // The supplier will receive this payment
    amount: totalAmount,
    status: 'pending',
    payment_date: new Date().toISOString()
  }])
```

**CHANGE TO:**
```javascript
const { data: paymentData, error: paymentError } = await supabase
  .from('payment')
  .insert([{
    order_id: orderData.order_id,
    paid_by: req.user.userId,  // Manufacturer making the payment
    paid_to: supplier_id,      // Supplier receiving the payment
    amount: totalAmount,
    status: 'pending',
    payment_date: new Date().toISOString()
  }])
```

### 2. Backend/routes/manufacturer.js - GET /payments endpoint

**CHANGE FROM:**
```javascript
const { data: payments, error: paymentError } = await supabase
  .from('payment')
  .select('*')
  .in('order_id', (orders || []).map(o => o.order_id));
```

**CHANGE TO:**
```javascript
const { data: payments, error: paymentError } = await supabase
  .from('payment')
  .select('*')
  .eq('paid_by', req.user.userId)  // Only show payments made by this manufacturer
  .in('order_id', (orders || []).map(o => o.order_id));
```

### 3. Backend/routes/supplier.js - GET /payments endpoint

**CHANGE FROM:**
```javascript
const { data: payments, error: paymentError } = await supabase
  .from('payment')
  .select('*')
  .in('order_id', (orders || []).map(o => o.order_id));
```

**CHANGE TO:**
```javascript
const { data: payments, error: paymentError } = await supabase
  .from('payment')
  .select('*')
  .eq('paid_to', req.user.userId)  // Only show payments received by this supplier
  .in('order_id', (orders || []).map(o => o.order_id));
```

### 4. Backend/routes/supplier.js - PUT /payments/:payment_id/status endpoint

**NO MAJOR CHANGES NEEDED** - The payment status update logic remains the same. The trigger will use `NEW.paid_to` instead of `NEW.user_id`.

### 5. Backend/routes/analytics.js - Payment analytics (Line ~141)

**CHANGE FROM:**
```sql
WHERE payment_id = $2 AND user_id = $3 RETURNING *
```

**CHANGE TO:**
```sql
WHERE payment_id = $2 AND (paid_by = $3 OR paid_to = $3) RETURNING *
```

---

## Frontend Code Changes Required

### 1. frontend/components/manufacturer-payments-panel.tsx
- No changes needed - uses the same payment object structure from backend

### 2. frontend/components/supplier-payments-panel.tsx
- No changes needed - uses the same payment object structure from backend

### 3. Frontend API calls
- No changes needed - the response structure remains the same

---

## Data Migration Notes

When running the migration:
1. The script will preserve all existing payment data
2. `paid_by` will be populated from `orders.ordered_by` (the manufacturer)
3. `paid_to` will be populated from the old `user_id` (the supplier)
4. All foreign key relationships will be maintained
5. The trigger will be recreated to use `paid_to` for revenue creation

---

## Steps to Execute

1. **Run the migration in Supabase SQL Editor:**
   - Copy the entire content of `supabase/migrations/20251210_refactor_payment_table.sql`
   - Execute in Supabase SQL Editor

2. **Update Backend Code:**
   - Update manufacturer.js POST /orders (change user_id to paid_by/paid_to)
   - Update manufacturer.js GET /payments (add filter on paid_by)
   - Update supplier.js GET /payments (add filter on paid_to)
   - Update analytics.js (update WHERE clause)

3. **Test:**
   - Create a new order - payment should have paid_by and paid_to populated
   - Manufacturer should only see their own outgoing payments
   - Supplier should only see their own incoming payments
   - Payment status updates should trigger revenue creation correctly

---

## Benefits of This Change

✅ Clear separation between who pays and who receives payment
✅ Better for multi-tenant payment tracking
✅ Easier to audit payment flows in the system
✅ Clearer data model for future features
✅ Automatic filtering based on user role
