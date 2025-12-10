-- Migration: Add paid_by and paid_to columns to payment table
-- This is a safer approach that modifies the existing table in-place

-- Step 1: Add new columns (they will be nullable initially)
ALTER TABLE payment
ADD COLUMN IF NOT EXISTS paid_by uuid REFERENCES users(user_id),
ADD COLUMN IF NOT EXISTS paid_to uuid REFERENCES users(user_id);

-- Step 2: Populate the new columns from existing data
-- paid_to = the original user_id (supplier receiving payment)
-- paid_by = the manufacturer who ordered (from orders table)
UPDATE payment p
SET 
  paid_to = COALESCE(paid_to, p.user_id),  -- Keep existing paid_to or use user_id as supplier
  paid_by = COALESCE(paid_by, o.ordered_by)  -- Get manufacturer from orders
FROM orders o
WHERE p.order_id = o.order_id
  AND (p.paid_to IS NULL OR p.paid_by IS NULL);

-- Step 3: Make columns NOT NULL (after data is populated)
ALTER TABLE payment
ALTER COLUMN paid_to SET NOT NULL,
ALTER COLUMN paid_by SET NOT NULL;

-- Step 4: Verify the trigger exists with correct column names
-- Drop old trigger if it still references user_id
DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;
DROP FUNCTION IF EXISTS create_revenue_on_paid_payment();

-- Step 5: Recreate the trigger with new column names
CREATE OR REPLACE FUNCTION create_revenue_on_paid_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to 'paid', create a revenue entry
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status != 'paid') THEN
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

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_paid_to ON payment(paid_to);
CREATE INDEX IF NOT EXISTS idx_payment_paid_by ON payment(paid_by);

-- All done!
