# Fix Foreign Key Constraint Issue for Food Listings

## Problem Description

You're experiencing a foreign key constraint violation error when trying to create food listings:

```
insert or update on table "food_listings" violates foreign key constraint "food_listings_user_id_fkey"
```

This error occurs because the `food_listings` table is trying to reference a `user_id` that doesn't exist in the referenced table.

## Root Cause

The issue is in the database schema design:

1. **Current Setup**: The `food_listings` table has a foreign key constraint that references `auth.users(id)`
2. **Authentication Mismatch**: Your app uses a custom JWT authentication system that creates users in the `profiles` table, but the food listings table expects users to exist in Supabase's `auth.users` table
3. **Missing Users**: When you try to create a food listing, the `user_id` from your session doesn't exist in `auth.users`, causing the constraint violation

## Solution Options

### Option 1: Fix the Foreign Key Reference (Recommended)

Change the `food_listings` table to reference the `profiles` table instead of `auth.users`:

1. **Run the fixed migration**: Use `fixed-migration.sql` which creates the table with the correct foreign key reference
2. **This approach is safer** as it doesn't interfere with Supabase's authentication system

### Option 2: Create Missing User in auth.users

If you prefer to keep the current structure, you can manually create the missing user in `auth.users`:

1. **Run the diagnostic script**: Use `diagnose-user-issue.sql` to identify your current user ID
2. **Create the user**: Use `fix-foreign-key-constraint.sql` to create the missing user record
3. **Note**: This approach is more complex and may cause issues with Supabase's authentication system

## Step-by-Step Fix (Option 1 - Recommended)

### Step 1: Run the Diagnostic Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `diagnose-user-issue.sql`
4. Run the script to see the current state

### Step 2: Apply the Fixed Migration

1. In the SQL Editor, copy and paste the contents of `fixed-migration.sql`
2. **Important**: Replace any placeholder values with your actual data
3. Run the script

### Step 3: Verify the Fix

1. Run the diagnostic script again to confirm:
   - The foreign key now references `profiles(id)` instead of `auth.users(id)`
   - RLS policies are properly configured
   - The table structure is correct

### Step 4: Test Food Listing Creation

1. Go to your app and try to create a food listing
2. Check the browser console for any remaining errors
3. Verify the listing appears in your database

## Alternative Quick Fix (Option 2)

If you want to keep the current structure temporarily:

1. **Disable RLS**: Run `disable-rls.sql` to temporarily disable row-level security
2. **Fix the constraint**: Use `fix-foreign-key-constraint.sql` to create the missing user
3. **Re-enable RLS**: Once the user exists, re-enable RLS with proper policies

## Prevention

To prevent this issue in the future:

1. **Consistent Authentication**: Use either Supabase auth OR custom JWT, not a mix of both
2. **Proper Schema Design**: Ensure foreign key references match your actual user storage
3. **Testing**: Always test database operations with your authentication system

## Files Created

- `fixed-migration.sql` - Corrected migration that references profiles table
- `diagnose-user-issue.sql` - Diagnostic script to identify current issues
- `fix-foreign-key-constraint.sql` - Alternative fix for auth.users reference
- `FOREIGN_KEY_FIX_GUIDE.md` - This guide

## Next Steps

1. **Run the diagnostic script** to understand your current database state
2. **Choose your preferred solution** (Option 1 is recommended)
3. **Apply the fix** using the appropriate SQL script
4. **Test the functionality** by creating a food listing
5. **Monitor for any remaining issues**

## Support

If you continue to experience issues after applying these fixes:

1. Check the browser console for new error messages
2. Run the diagnostic script again to see what changed
3. Verify that your user authentication is working properly
4. Ensure all foreign key relationships are properly established
