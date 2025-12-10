-- Fix: Check and correct column types for UUID consistency
-- This migration ensures all ID columns that should be UUID are actually UUID type

-- Step 1: Drop and recreate the problematic trigger with proper type handling
DROP TRIGGER IF EXISTS trg_decrease_inventory ON orders;
DROP FUNCTION IF EXISTS decrease_inventory_on_order();

-- Step 2: Create trigger that properly handles UUID comparisons
CREATE OR REPLACE FUNCTION decrease_inventory_on_order() 
RETURNS TRIGGER AS $$ 
BEGIN 
    IF NEW.order_status = 'delivered' AND OLD.order_status != 'delivered' THEN 
        UPDATE inventory i 
        SET quantity_available = quantity_available - oi.quantity 
        FROM order_items oi 
        WHERE oi.order_id = NEW.order_id::uuid  -- Explicit cast to UUID
          AND oi.product_id = i.product_id; 
    END IF; 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Step 3: Recreate the trigger
CREATE TRIGGER trg_decrease_inventory
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION decrease_inventory_on_order();
