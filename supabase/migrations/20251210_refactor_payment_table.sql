-- Migration to refactor payment table
-- Remove user_id and add paid_to (supplier) and paid_by (manufacturer)

-- Step 1: Create new payment table with correct structure
CREATE TABLE payment_new (
  payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES users(user_id),  -- Manufacturer who made the payment
  paid_to uuid NOT NULL REFERENCES users(user_id),  -- Supplier who receives the payment
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payment_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Step 2: Copy data from old payment table to new one
INSERT INTO payment_new (payment_id, order_id, paid_by, paid_to, amount, status, payment_date, created_at, updated_at)
SELECT 
  p.payment_id,
  p.order_id,
  COALESCE(o.ordered_by, 'MAN_00001'::uuid),  -- paid_by = manufacturer who ordered
  p.user_id,  -- paid_to = the original user_id (supplier)
  p.amount,
  p.status,
  p.payment_date,
  p.created_at,
  p.updated_at
FROM payment p
LEFT JOIN orders o ON p.order_id = o.order_id;

-- Step 3: Drop old triggers and views that depend on payment table
DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;
DROP FUNCTION IF EXISTS create_revenue_on_paid_payment();
DROP VIEW IF EXISTS vw_retailer_sales_summary CASCADE;

-- Step 4: Drop old payment table and rename new one
DROP TABLE IF EXISTS payment CASCADE;
ALTER TABLE payment_new RENAME TO payment;

-- Step 5: Recreate the trigger with new column names
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
      NEW.paid_to,  -- Revenue goes to the supplier (paid_to)
      NEW.amount::numeric(12,2),
      NOW()
    );
    
    RAISE NOTICE 'Revenue entry created: supplier=%, amount=%, order_id=%', NEW.paid_to, NEW.amount, NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();

-- Step 6: Recreate the view
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

-- Step 7: Create indexes for performance
CREATE INDEX idx_payment_paid_to ON payment(paid_to);
CREATE INDEX idx_payment_paid_by ON payment(paid_by);
CREATE INDEX idx_payment_order_id ON payment(order_id);
CREATE INDEX idx_payment_status ON payment(status);
