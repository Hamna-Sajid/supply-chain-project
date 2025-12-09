-- ============================================
-- Shipment Inventory Management Triggers
-- ============================================
-- This migration adds automatic inventory management when shipments are accepted or delivered
-- Execute these SQL statements in your Supabase SQL Editor to apply the triggers

-- 1. Trigger to decrease manufacturer inventory when shipment is accepted
CREATE OR REPLACE FUNCTION decrease_inventory_on_shipment_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Decrease inventory quantity_available for the manufacturer
    UPDATE inventory
    SET quantity_available = quantity_available - NEW.quantity
    WHERE product_id = NEW.product_id 
    AND user_id = NEW.manufacturer_id
    AND quantity_available >= NEW.quantity;
    
    -- Log the update
    RAISE NOTICE 'Decreased inventory for product % by % units for manufacturer %', 
      NEW.product_id, NEW.quantity, NEW.manufacturer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS shipment_accepted_inventory_trigger ON shipments;

-- Create trigger for shipment acceptance
CREATE TRIGGER shipment_accepted_inventory_trigger
AFTER UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION decrease_inventory_on_shipment_accepted();

-- ============================================

-- 2. Trigger to increase warehouse inventory when shipment is delivered
CREATE OR REPLACE FUNCTION increase_inventory_on_shipment_delivered()
RETURNS TRIGGER AS $$
DECLARE
  product_data RECORD;
BEGIN
  -- Only trigger when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Get product details from the shipment
    SELECT products.cost_price, products.selling_price 
    INTO product_data
    FROM products 
    WHERE product_id = NEW.product_id;
    
    -- Check if warehouse already has this product in inventory
    IF EXISTS (SELECT 1 FROM inventory WHERE product_id = NEW.product_id AND user_id = NEW.whm_id) THEN
      -- Update existing inventory entry
      UPDATE inventory
      SET quantity_available = quantity_available + NEW.quantity
      WHERE product_id = NEW.product_id AND user_id = NEW.whm_id;
    ELSE
      -- Create new inventory entry for warehouse
      INSERT INTO inventory (product_id, user_id, quantity_available, cost_price, selling_price, reorder_level)
      VALUES (NEW.product_id, NEW.whm_id, NEW.quantity, COALESCE(product_data.cost_price, 0), COALESCE(product_data.selling_price, 0), 10);
    END IF;
    
    -- Log the update
    RAISE NOTICE 'Increased inventory for product % by % units for warehouse %', 
      NEW.product_id, NEW.quantity, NEW.whm_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS shipment_delivered_inventory_trigger ON shipments;

-- Create trigger for shipment delivery
CREATE TRIGGER shipment_delivered_inventory_trigger
AFTER UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION increase_inventory_on_shipment_delivered();

-- ============================================
-- Summary of Triggers:
-- ============================================
-- 1. When a shipment status is updated to 'accepted':
--    - The manufacturer's inventory for that product decreases by the shipment quantity
--
-- 2. When a shipment status is updated to 'delivered':
--    - The warehouse's inventory for that product increases by the shipment quantity
--    - If warehouse doesn't have the product in inventory, a new entry is created
--    - Cost price and selling price are copied from the product master data
-- ============================================

