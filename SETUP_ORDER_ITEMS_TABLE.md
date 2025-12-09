# Order Items Table Setup Guide

## Problem
The `order_items` table doesn't exist in your Supabase database, causing order creation to fail with error messages.

## Solution
You need to create the `order_items` table in Supabase. Here are three methods:

## Method 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project
   - Click on "SQL Editor" in the left sidebar

2. **Create the Table**
   - Click "+ New Query"
   - Copy and paste the SQL from `supabase/migrations/20251210_create_order_items_table.sql`
   - Click "Run" (or press Ctrl+Enter)
   - You should see success message

3. **Verify**
   - Go to "Table Editor" in the sidebar
   - You should see `order_items` table listed
   - Click it to verify the columns: order_item_id, order_id, product_id, quantity, unit_price, created_at, updated_at

## Method 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```powershell
   npm install -g supabase
   ```

2. **Link Project**
   ```powershell
   cd d:\supply-chain-project
   supabase link --project-ref <your-project-id>
   # You can find project-ref in Supabase dashboard URL: app.supabase.com/projects/<project-id>
   ```

3. **Run Migration**
   ```powershell
   supabase migration up
   ```

## Method 3: Using SQL Terminal

1. **Open Terminal/PowerShell**

2. **Use psql if you have PostgreSQL installed**
   ```powershell
   psql -h <your-supabase-host> -U postgres -d postgres
   # Enter password when prompted
   ```

3. **Run the SQL commands from** `supabase/migrations/20251210_create_order_items_table.sql`

## SQL Statement (If doing manually)

```sql
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true)
  TO service_role;

CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_items_update_timestamp ON order_items;
CREATE TRIGGER order_items_update_timestamp
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_items_updated_at();
```

## What This Creates

1. **order_items Table** with columns:
   - `order_item_id` - Primary key (auto-increment)
   - `order_id` - Foreign key to orders table
   - `product_id` - Material/product ID
   - `quantity` - Number of units
   - `unit_price` - Price per unit
   - `created_at` - Timestamp when created
   - `updated_at` - Timestamp when last updated

2. **Indexes** for faster queries:
   - On order_id for quick lookup by order
   - On product_id for quick lookup by product

3. **RLS Policy** for security:
   - Allows service role (backend) to access data

4. **Trigger** to automatically update timestamps

## After Creating the Table

1. **Restart Backend Server**
   ```powershell
   # Stop: Ctrl+C in terminal where npm start is running
   # Restart:
   npm start
   ```

2. **Test Order Creation**
   - Go to material sourcing page
   - Select a material
   - Enter quantity
   - Click "Place Order"
   - Check for success message

3. **Verify in Supabase**
   - Go to Supabase Dashboard
   - Table Editor → order_items
   - You should see your new order item entries

## Troubleshooting

**Error: "relation does not exist"**
- The table wasn't created successfully
- Run the SQL query again, making sure there are no errors

**Error: "permission denied"**
- RLS policy issue
- Run the policy creation SQL again

**Error: "foreign key violation"**
- The orders table might not have the order you're trying to reference
- Check that orders table exists and has data

**Error: "column does not exist"**
- You might have a different column name
- Check the table schema in Supabase Dashboard

## Next Steps

1. ✅ Create the order_items table using one of the methods above
2. ✅ Restart the backend server
3. ✅ Try placing an order again
4. ✅ Check the Supabase dashboard to verify order_items are being created
5. ✅ Commit the migration file to git

```bash
git add supabase/migrations/20251210_create_order_items_table.sql
git commit -m "feat: Add order_items table migration"
git push
```

## Getting Help

If the table creation fails:
1. Check the exact error message in Supabase Dashboard
2. Verify your orders table exists
3. Ensure you have appropriate permissions in Supabase
4. Try creating just the basic table first without RLS/policies
