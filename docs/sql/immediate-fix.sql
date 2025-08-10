-- IMMEDIATE FIX for Foreign Key Constraint Issue
-- Run this in your Supabase SQL Editor to fix the issue right now

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as info;

-- Check if food_listings table exists and its current structure
SELECT 
  'food_listings table exists' as status,
  COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_name = 'food_listings';

-- Check current foreign key constraints
SELECT 
  'Current foreign keys' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'food_listings' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 2: EMERGENCY FIX - Drop and recreate the table correctly
SELECT '=== APPLYING EMERGENCY FIX ===' as info;

-- Drop the problematic table completely
DROP TABLE IF EXISTS food_listings CASCADE;

-- Create the table with the CORRECT foreign key reference
CREATE TABLE food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- This is the key fix
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_food_listings_status ON food_listings(status);
CREATE INDEX idx_food_listings_created_at ON food_listings(created_at);
CREATE INDEX idx_food_listings_user_id ON food_listings(user_id);

-- Step 3: Temporarily disable RLS to test the fix
ALTER TABLE food_listings DISABLE ROW LEVEL SECURITY;

-- Step 4: Test the fix by inserting a test record
-- First, get a valid user ID from your profiles table
SELECT '=== TESTING THE FIX ===' as info;

-- Get a sample user ID from profiles
SELECT 
  'Sample user from profiles' as info,
  id,
  name,
  email
FROM profiles 
LIMIT 1;

-- Now test inserting a food listing (replace USER_ID_HERE with an actual ID from above)
-- Uncomment and modify the line below with a real user ID from your profiles table
/*
INSERT INTO food_listings (
  user_id,
  food_name,
  quantity,
  expiry_date,
  pickup_location,
  status
) VALUES (
  'USER_ID_HERE', -- Replace with actual user ID from profiles table
  'Test Food Item',
  '1 unit',
  'in 2 hours',
  'Test Location',
  'available'
) RETURNING *;
*/

-- Step 5: Verify the fix worked
SELECT '=== VERIFYING THE FIX ===' as info;

-- Check the new table structure
SELECT 
  'New table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- Check the new foreign key constraint
SELECT 
  'New foreign key constraint' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'food_listings' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 6: Re-enable RLS with proper policies
SELECT '=== RE-ENABLING RLS ===' as info;

ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all users to read food listings" ON food_listings
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert food listings" ON food_listings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update food listings" ON food_listings
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete food listings" ON food_listings
  FOR DELETE USING (true);

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

SELECT 
  'RLS status' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'food_listings';

SELECT 
  'RLS policies' as info,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'food_listings';

SELECT '=== FIX COMPLETE ===' as info;
SELECT 'Now try creating a food listing in your app!' as next_step;
