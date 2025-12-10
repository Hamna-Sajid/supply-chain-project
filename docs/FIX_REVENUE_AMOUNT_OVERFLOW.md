## Fix: Revenue Table Amount Overflow

### Problem
The `revenue` table's `amount` column is defined as `numeric(5,2)` which only allows values up to 999.99. When you try to record a payment amount larger than this, you get an overflow error.

### Solution
Increase the column precision to `numeric(12,2)` which allows amounts up to 9,999,999.99.

### To Apply in Supabase:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this SQL:**

```sql
ALTER TABLE revenue
ALTER COLUMN amount TYPE numeric(12,2);
```

3. **Click "Run"** → Should see "Query executed successfully"

4. **Restart backend** - Stop (Ctrl+C) and run `npm start`

5. **Try marking payment as paid again** - Should work now!

### What Changed:
- Old: `numeric(5,2)` = max value 999.99
- New: `numeric(12,2)` = max value 9,999,999.99

This allows you to record much larger payment amounts without overflow errors.
