-- Payment to Revenue Trigger - Quick Reference
-- Copy and paste into Supabase SQL Editor

-- The trigger automatically creates a revenue entry when a payment is marked as 'paid'
-- It uses amount directly from the payment table (payment.amount)
-- It prevents duplicate revenues for the same payment

CREATE OR REPLACE FUNCTION create_revenue_on_paid_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revenue if:
  -- 1. New status is 'paid'
  -- 2. Old status was NOT 'paid' (prevents duplicates on multiple updates)
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

DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;

CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();
