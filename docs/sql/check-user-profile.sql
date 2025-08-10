-- Check and create user profiles
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check if profiles table exists and has data
SELECT 
  COUNT(*) as profile_count
FROM profiles;

-- Show some sample profiles
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- If you need to create a profile for a specific user, uncomment and modify this:
-- INSERT INTO profiles (id, name, email, role, verified)
-- VALUES ('USER_ID_HERE', 'User Name', 'user@example.com', 'User', true);
