-- THIS MUST BE RUN IN SUPABASE SQL EDITOR
-- Drop the existing order_items table (this will delete all data!)
DROP TABLE IF EXISTS order_items CASCADE;

-- Create a clean order_items table WITHOUT any foreign key constraints on product_id
-- and WITHOUT subtotal column
CREATE TABLE order_items (
  order_item_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- DONE! The table should now be ready for order items insertion
