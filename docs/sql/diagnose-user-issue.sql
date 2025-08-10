-- Diagnostic script to identify user authentication and foreign key issues
-- Run this in your Supabase SQL Editor

-- Step 1: Check if profiles table exists and has data
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM profiles;

-- Step 2: Check if food_listings table exists
SELECT 
  'food_listings' as table_name,
  COUNT(*) as record_count
FROM food_listings;

-- Step 3: Check current user session (if any)
SELECT 
  'Current auth.uid()' as info,
  auth.uid() as user_id;

-- Step 4: Check if current user has a profile
SELECT 
  'Current user profile' as info,
  p.id,
  p.name,
  p.email,
  p.role
FROM profiles p
WHERE p.id = auth.uid();

-- Step 5: Check foreign key constraints on food_listings
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'food_listings';

-- Step 6: Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- Step 7: Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'food_listings';

-- Step 8: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'food_listings';

-- Step 9: Sample some profiles to see what user IDs exist
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Step 10: Check if there are any orphaned food_listings records
SELECT 
  'Orphaned food listings' as info,
  fl.id,
  fl.user_id,
  fl.food_name
FROM food_listings fl
LEFT JOIN profiles p ON fl.user_id = p.id
WHERE p.id IS NULL;
