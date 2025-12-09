-- ============================================
-- Fix Inventory Table Unique Constraint
-- ============================================
-- Issue: Current constraint only on product_id prevents multiple warehouses
-- having the same product. Should be composite key on (product_id, user_id)

-- Step 1: Drop the incorrect unique constraint
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_id_key;

-- Step 2: Add correct composite unique constraint
ALTER TABLE inventory ADD CONSTRAINT inventory_product_id_user_id_key UNIQUE (product_id, user_id);

-- Summary:
-- - Old constraint: product_id (WRONG - only one warehouse per product)
-- - New constraint: (product_id, user_id) (CORRECT - each user can have unique product)
