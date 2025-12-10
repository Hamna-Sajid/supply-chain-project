# Quick Migration SQL - Copy & Paste into Supabase SQL Editor

##  CRITICAL: Run this SQL in your Supabase Database IMMEDIATELY

**Navigate to:** Supabase Dashboard → Your Project → SQL Editor → New Query

**Copy and paste this entire SQL block into the editor, then click "Run":**

```sql
-- Migration: Add paid_by and paid_to columns to payment table
-- This adds the new columns needed by the updated backend code

-- Step 1: Add new columns
ALTER TABLE payment
ADD COLUMN IF NOT EXISTS paid_by uuid REFERENCES users(user_id),
ADD COLUMN IF NOT EXISTS paid_to uuid REFERENCES users(user_id);

-- Step 2: Populate the new columns from existing data
UPDATE payment p
SET 
  paid_to = COALESCE(paid_to, p.user_id),
  paid_by = COALESCE(paid_by, o.ordered_by)
FROM orders o
WHERE p.order_id = o.order_id
  AND (p.paid_to IS NULL OR p.paid_by IS NULL);

-- Step 3: Make columns NOT NULL
ALTER TABLE payment
ALTER COLUMN paid_to SET NOT NULL,
ALTER COLUMN paid_by SET NOT NULL;

-- Step 4: Recreate the trigger with correct column names
DROP TRIGGER IF EXISTS trigger_payment_to_revenue ON payment;
DROP FUNCTION IF EXISTS create_revenue_on_paid_payment();

CREATE OR REPLACE FUNCTION create_revenue_on_paid_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO revenue (
      user_id,
      amount,
      created_at
    ) VALUES (
      NEW.paid_to,
      NEW.amount::numeric(12,2),
      NOW()
    );
    
    RAISE NOTICE 'Revenue entry created: supplier=%, amount=%, order_id=%', NEW.paid_to, NEW.amount, NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_to_revenue
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION create_revenue_on_paid_payment();

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_paid_to ON payment(paid_to);
CREATE INDEX IF NOT EXISTS idx_payment_paid_by ON payment(paid_by);

```

## After Running This SQL

1. You should see a success message with no errors
2. Come back to your terminal
3. Stop the server (Ctrl+C)
4. Run: `npm start`
5. Test creating an order

## What This Does

 Adds `paid_by` column (manufacturer who made the payment)
 Adds `paid_to` column (supplier who receives the payment)  
 Populates both columns with correct data
 Updates the revenue trigger to use the new columns
 Makes columns required (NOT NULL)
 Adds performance indexes

## No Risk of Data Loss

- All existing payments are preserved
- Data is intelligently migrated to the new columns
- The `user_id` column remains untouched (can be deleted later if desired)

---

**Status:** Backend code  | Database schema  **← RUN THIS SQL NOW**
