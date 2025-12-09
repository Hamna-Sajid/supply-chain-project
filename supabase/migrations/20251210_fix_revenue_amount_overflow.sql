-- Fix: Update revenue table to handle larger amounts
-- This increases the amount column from numeric(5,2) to numeric(12,2)
-- numeric(12,2) allows amounts up to 9,999,999.99

-- First, drop any views that depend on the revenue table's amount column
-- We'll need to recreate them after altering the column
DROP VIEW IF EXISTS vw_retailer_sales_summary CASCADE;

-- Now alter the column type
ALTER TABLE revenue
ALTER COLUMN amount TYPE numeric(12,2);

-- Note: If vw_retailer_sales_summary existed and is needed, 
-- it will need to be recreated. Check your views after running this migration.
