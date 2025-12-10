-- Fix numeric column types for payment and revenue tables
-- This ensures they can handle amounts up to 999,999,999.99

-- Drop dependent trigger first
DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;
DROP FUNCTION IF EXISTS create_revenue_on_paid_payment();

-- Drop dependent view
DROP VIEW IF EXISTS vw_retailer_sales_summary CASCADE;

-- Alter the payment table
ALTER TABLE payment 
ALTER COLUMN amount TYPE numeric(12,2) USING amount::numeric(12,2);

-- Alter the revenue table
ALTER TABLE revenue 
ALTER COLUMN amount TYPE numeric(12,2) USING amount::numeric(12,2);

-- Recreate the trigger function with proper numeric handling
CREATE OR REPLACE FUNCTION create_revenue_on_paid_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to 'paid', create a revenue entry
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO revenue (
      user_id,
      amount,
      created_at
    ) VALUES (
      NEW.user_id,
      NEW.amount::numeric(12,2),  -- Explicit cast to ensure proper type
      NOW()
    );
    
    RAISE NOTICE 'Revenue entry created: user_id=%, amount=%, order_id=%', NEW.user_id, NEW.amount, NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();

-- Recreate the view
CREATE VIEW vw_retailer_sales_summary AS
SELECT 
  u.user_id,
  u.name,
  COUNT(DISTINCT r.revenue_id) as total_transactions,
  SUM(r.amount) as total_revenue,
  AVG(r.amount) as avg_revenue
FROM users u
LEFT JOIN revenue r ON u.user_id = r.user_id
WHERE u.role = 'retailer'
GROUP BY u.user_id, u.name;
