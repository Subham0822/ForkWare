-- Fix Foreign Key Constraint Issue for food_listings
-- Run this in your Supabase SQL Editor

-- Step 1: Check current table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- Step 2: Check if the user exists in auth.users
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from your session
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE id = 'YOUR_USER_ID_HERE';

-- Step 3: If user doesn't exist in auth.users, create them
-- This is a workaround - normally users should be created through Supabase auth
-- Replace the values with your actual user information
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID
  'your-email@example.com', -- Replace with your actual email
  crypt('temporary-password', gen_salt('bf')), -- Temporary password
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Step 4: Alternative approach - Modify the food_listings table to use profiles table instead
-- This is safer as it doesn't interfere with Supabase auth
ALTER TABLE food_listings 
DROP CONSTRAINT IF EXISTS food_listings_user_id_fkey;

-- Add new foreign key to profiles table
ALTER TABLE food_listings 
ADD CONSTRAINT food_listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 5: Verify the fix
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

-- Step 6: Test inserting a food listing
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your profiles table
INSERT INTO food_listings (
  user_id,
  food_name,
  quantity,
  expiry_date,
  pickup_location,
  status,
  image_url
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID from profiles table
  'Test Food Item',
  '1 unit',
  'in 2 hours',
  'Test Location',
  'available',
  NULL
) RETURNING *;

-- Step 7: Clean up test data
DELETE FROM food_listings WHERE food_name = 'Test Food Item';
