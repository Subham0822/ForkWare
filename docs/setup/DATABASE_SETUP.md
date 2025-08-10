# Database Setup Guide

## Prerequisites

1. You need a Supabase project set up
2. Your environment variables should be configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 1: Create the food_listings table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-migration.sql`
4. Run the SQL script

## Step 2: Verify the table structure

The `food_listings` table should have the following columns:

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `food_name` (TEXT, NOT NULL)
- `quantity` (TEXT, NOT NULL)
- `expiry_date` (TEXT, NOT NULL)
- `pickup_location` (TEXT, NOT NULL)
- `status` (TEXT, NOT NULL, CHECK constraint)
- `image_url` (TEXT, nullable)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

## Step 3: Test the functionality

1. Make sure you're logged in to the application
2. Go to the Admin page
3. Try adding a new food listing
4. Check the Volunteers page to see if it appears

## Troubleshooting

If you get authentication errors:

1. Make sure you're logged in
2. Check that the user has a profile in the `profiles` table
3. Verify that RLS policies are working correctly

If you get table not found errors:

1. Make sure the SQL migration ran successfully
2. Check that the table exists in your Supabase dashboard
3. Verify the table name is exactly `food_listings`
