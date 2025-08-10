# Complete Solution for Food Listings Foreign Key Error

## The Problem

You're experiencing a foreign key constraint violation when creating food listings:

```
insert or update on table "food_listings" violates foreign key constraint "food_listings_user_id_fkey"
```

## Root Causes (There are TWO issues)

### 1. Database Schema Issue

- Your `food_listings` table references `auth.users(id)`
- But your app uses a custom JWT system that stores users in the `profiles` table
- The `user_id` being passed doesn't exist in `auth.users`

### 2. Code Authentication Issue

- Your `convertListingToDB` function tries to get user ID from `supabase.auth.getSession()`
- But your app uses custom JWT tokens stored in cookies
- This results in `undefined` user IDs being passed to the database

## Complete Solution

### Step 1: Fix the Database (Run this FIRST)

1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `immediate-fix.sql`
3. Run the script
4. This will:
   - Drop the problematic table
   - Recreate it with correct foreign key to `profiles(id)`
   - Temporarily disable RLS for testing
   - Create proper indexes

### Step 2: Fix the Code (Already Done)

I've updated your `food-listings-context.tsx` file to:

- Add a `getCurrentUserId()` function that gets the user ID from your custom JWT
- Update `convertListingToDB()` to use the correct user ID source
- Handle both custom JWT and Supabase auth as fallback

### Step 3: Test the Fix

1. **Test the database fix**: Run the `immediate-fix.sql` script
2. **Test the code fix**: Try creating a food listing in your app
3. **Check the console**: Look for any remaining errors

## What Each File Does

- **`immediate-fix.sql`** - Emergency database fix that completely rebuilds the table
- **`test-user-id.js`** - Debug script to test user ID retrieval (run in browser console)
- **Updated `food-listings-context.tsx`** - Fixed authentication logic

## If You Still Get Errors

### Check the Console

Look for these specific error messages:

- `"User not authenticated"` → Authentication issue
- `"relation does not exist"` → Database table issue
- `"foreign key constraint"` → Database schema issue

### Run the Test Script

1. Open browser console on your app
2. Copy and paste the contents of `test-user-id.js`
3. Run it to see what user ID is being retrieved

### Verify Database State

Run this in Supabase SQL Editor:

```sql
-- Check if table exists and has correct structure
SELECT * FROM information_schema.tables WHERE table_name = 'food_listings';

-- Check foreign key constraints
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'food_listings';
```

## Expected Results After Fix

1. **Database**: `food_listings` table references `profiles(id)` not `auth.users(id)`
2. **Code**: User ID is retrieved from your custom JWT session
3. **Functionality**: Food listings can be created without foreign key errors

## Next Steps

1. **Run `immediate-fix.sql`** in Supabase
2. **Test creating a food listing** in your app
3. **Check browser console** for any remaining errors
4. **Run `test-user-id.js`** if you need to debug authentication

The fix addresses both the database schema mismatch AND the code authentication issue, so it should resolve your problem completely.
