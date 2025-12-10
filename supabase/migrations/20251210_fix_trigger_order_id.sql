-- Fix: Update trigger to correctly insert order_id with revenue entries
-- Uses correct column names from payment table

DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;
DROP FUNCTION IF EXISTS create_revenue_on_paid_payment();

CREATE OR REPLACE FUNCTION create_revenue_on_paid_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to 'paid', create a revenue entry with order_id
  IF NEW.payment_status = 'paid' AND (OLD IS NULL OR OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    INSERT INTO revenue (
      user_id,
      amount,
      order_id,
      created_at
    ) VALUES (
      NEW.paid_to,  -- Revenue goes to the supplier (paid_to)
      NEW.payment_amount,  -- Use payment_amount column
      NEW.order_id,  -- Include order_id from payment table
      NOW()
    );
    
    RAISE NOTICE 'Revenue entry created: supplier=%, amount=%, order_id=%', NEW.paid_to, NEW.payment_amount, NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();
