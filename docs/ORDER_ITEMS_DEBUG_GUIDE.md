# Order Items Insertion Debug Guide

## Current Issue
When placing an order from the manufacturer's material sourcing page, the order is created successfully but the order items fail to insert into the `order_items` table.

## Steps to Debug

### 1. Check Terminal Logs
When you place an order and it fails, look at the backend terminal (where `npm start` is running) for detailed error messages.

You should see logs like:
```
[Item 1/1] Processing: { material_id: '...', quantity: 1, unit_price: 100 }
[Item 1] Payload: { order_id: 'xxx', product_id: 'yyy', quantity: 1, unit_price: 100 }
[Item 1]  SUPABASE ERROR:
{
  code: '...',
  message: '...',
  details: '...',
  hint: '...',
  statusCode: ...
}
```

### 2. Common Error Codes and Solutions

#### Error: PGRST301 (Relation not found)
**Meaning:** The `order_items` table doesn't exist in Supabase
**Solution:** Create the table in Supabase with this SQL:
```sql
CREATE TABLE order_items (
  order_item_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Error: Missing foreign key
**Meaning:** The `order_id` value doesn't exist in the `orders` table
**Solution:** This shouldn't happen since we just created the order, but if it does:
- Ensure the order_id is correctly returned from the orders insert
- Check that both tables are in the same schema

#### Error: RLS violation or permission denied
**Meaning:** Row Level Security (RLS) policies are preventing insert
**Solution:**
1. Go to Supabase Dashboard
2. Navigate to: Authentication → Policies
3. Check if `order_items` table has RLS enabled
4. Either disable RLS or create appropriate policies

#### Error: Column not found
**Meaning:** We're trying to insert into a column that doesn't exist
**Possible column names to check:**
- `order_item_id` - auto-generated, don't include
- `order_id` - required, must exist
- `product_id` - required, must exist
- `quantity` - required, must exist
- `unit_price` - required, must exist
- `created_at` - optional, auto-generated
- `updated_at` - optional, auto-generated

### 3. What We're Sending
The INSERT request includes:
```javascript
{
  order_id: "<UUID from orders table>",
  product_id: "<material_id from raw_materials>",
  quantity: <integer>,
  unit_price: <decimal>
}
```

### 4. Next Steps After Getting Error Details

Once you see the specific error message in the terminal:

1. **Copy the exact error code and message**
2. **Share with developer** including:
   - Full error object from terminal
   - The order_id that was created
   - The item data that failed to insert

3. **Possible fixes based on error:**
   - If table missing: Create it via Supabase SQL editor
   - If RLS issue: Disable RLS or add policies
   - If schema mismatch: Adjust column names/types

## Current Code Changes
Enhanced backend to provide detailed logging:
- File: `Backend/routes/manufacturer.js`
- Endpoint: `POST /api/manufacturer/orders`
- Lines: 569-690
- New: Comprehensive error logging with error codes, messages, hints
- New: Continues to next item even if one fails
- New: Returns partial success if at least one item inserted

## Testing Checklist
- [ ] See terminal error when placing order
- [ ] Note exact error code (e.g., PGRST301)
- [ ] Check if order was created in Supabase
- [ ] Check if order_items table exists in Supabase
- [ ] Verify table schema matches expectations
- [ ] Check RLS policies on order_items table
- [ ] Test again after any schema/policy changes

## Verify Order Was Created
Even if items fail, the order header should be in the database:
1. Go to Supabase Dashboard
2. Browse Data → orders table
3. Look for recent orders with your user_id in `ordered_by` column

## Quick Verification Command (if you have psql)
```sql
-- Check if table exists
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items');

-- Check table structure
\d order_items

-- Check RLS status
SELECT * FROM pg_class WHERE relname = 'order_items';
```
