-- Disable RLS policies for food_listings table
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to insert food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to update food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to delete food listings" ON food_listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON food_listings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON food_listings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON food_listings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON food_listings;
DROP POLICY IF EXISTS "Enable all access for admins" ON food_listings;

-- Disable RLS completely
ALTER TABLE food_listings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'food_listings';
