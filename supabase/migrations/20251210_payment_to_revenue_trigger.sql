-- Trigger to automatically create revenue entry when payment is marked as 'paid'
-- This trigger uses amount directly from the payment table (payment.amount)
-- Run this SQL in Supabase SQL Editor

-- Create or replace the function
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
      NEW.amount,  -- Uses amount column from payment table
      NOW()
    );
    
    RAISE NOTICE 'Revenue entry created: user_id=%, amount=%, order_id=%', NEW.user_id, NEW.amount, NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;

-- Create the trigger
CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();

-- Done! Now whenever a payment is marked as 'paid', it will automatically create a revenue entry
