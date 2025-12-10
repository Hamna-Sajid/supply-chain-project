# Database Migration: Payment Table Refactoring

**Status:** REQUIRED - Database schema must be updated to match backend code

## Problem
The backend code has been updated to use `paid_by` (manufacturer) and `paid_to` (supplier) columns in the payment table, but the Supabase database still has the old `user_id` column structure.

**Error occurring:**
```
column "user_id" of relation "payment" does not exist
```

This error happens when trying to create an order because the `manufacturer.POST /orders` endpoint tries to insert a payment record with the new column names, but the table schema doesn't have them yet.

## Solution

You have two options for applying this migration:

### Option 1: RECOMMENDED - Safe Additive Migration
**File:** `supabase/migrations/20251210_add_payment_columns_safe.sql`

This approach:
- Adds new columns to the existing table
- Populates them from existing data
- Preserves all existing payment records
- Recreates the trigger with correct column references
- Lowest risk of data loss

**To apply:**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to SQL Editor
4. Click "New Query"
5. Copy the entire contents of `supabase/migrations/20251210_add_payment_columns_safe.sql`
6. Click "Run"
7. Wait for completion (should see success message)

### Option 2: Full Table Refactor
**File:** `supabase/migrations/20251210_refactor_payment_table.sql`

This approach:
- Creates a completely new table with the correct structure
- Copies all data from the old table
- Drops and recreates the old table
- Highest compatibility but slightly more disruptive

**To apply:**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to SQL Editor
4. Click "New Query"
5. Copy the entire contents of `supabase/migrations/20251210_refactor_payment_table.sql`
6. Click "Run"
7. Wait for completion

## What Gets Changed

### Table Structure
**BEFORE:**
```
payment (
  payment_id uuid PK,
  order_id uuid FK,
  user_id uuid,        ← WILL BE REPLACED
  amount numeric(12,2),
  status text,
  payment_date timestamp,
  created_at timestamp
)
```

**AFTER:**
```
payment (
  payment_id uuid PK,
  order_id uuid FK,
  paid_by uuid FK,     ← NEW: Manufacturer who made payment
  paid_to uuid FK,     ← NEW: Supplier who receives payment
  amount numeric(12,2),
  status text,
  payment_date timestamp,
  created_at timestamp
)
```

### Payment Flow
**OLD:**
```
Manufacturer places order → Payment created (user_id = ???)
```

**NEW:**
```
Manufacturer places order
  → Automatic payment created
  → paid_by = manufacturer's user_id
  → paid_to = supplier's user_id
  → Trigger fires on status='paid' → Revenue created with user_id = paid_to
```

### Trigger Updates
The `create_revenue_on_paid_payment()` trigger will be updated to use `NEW.paid_to` instead of the old column reference.

## Backend Code Already Updated

These endpoint changes are already in the codebase:

1. **manufacturer.js POST /orders** (Line ~610)
   - Creates payment with: `paid_by: req.user.userId, paid_to: supplier_id`

2. **manufacturer.js GET /payments** (Line ~843)
   - Filters: `paid_by = req.user.userId`

3. **supplier.js GET /payments** (Line ~649)
   - Filters: `paid_to = req.user.userId`

4. **supplier.js POST /payments** (Line ~699)
   - Creates payment with: `paid_by: req.user.userId, paid_to: req.user.userId`

5. **supplier.js PUT /payments/:payment_id/status** (Line ~797)
   - Uses trigger for revenue creation

## After Migration

Once the SQL runs successfully:

1. **Restart the backend:**
   ```powershell
   npm start
   ```

2. **Test order creation:**
   - Go to: Manufacturer Dashboard → Material Sourcing
   - Try placing an order
   - Expected: Order created successfully

3. **Verify payment tracking:**
   - Check Manufacturer Payments tab
   - Check Supplier Payments tab
   - Both should show the new payment with correct amounts

4. **Verify revenue creation:**
   - Mark a payment as "paid" in supplier dashboard
   - Check supplier revenue tab
   - Expected: Revenue entry created automatically

## Troubleshooting

**If migration fails:**
1. Check the error message in Supabase SQL Editor
2. Common issues:
   - Foreign key constraint violation → Order data might be missing
   - Column already exists → Migration may have partially run before
   - Permission denied → Contact Supabase support

**If you need to rollback:**
- This migration is largely non-destructive (additive approach)
- Old data is preserved in the new columns
- Can manually revert by dropping the new columns if needed

## Timeline

- **Expected run time:** Less than 1 second
- **Blocking issues:** None (operation locks table briefly)
- **Verification:** Run a test order right after

## Next Steps

1.  Backend code is ready
2.  **RUN THE SQL MIGRATION** ← You are here
3. Restart backend server
4. Test order creation
5. Verify payment and revenue flow

---

**Questions?** Check the full refactoring documentation in `PAYMENT_TABLE_REFACTORING.md` or the migration files themselves for detailed comments.
