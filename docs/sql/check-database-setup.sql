-- Check current database setup
-- Run this in your Supabase SQL Editor to see what tables exist

-- Check if profiles table exists
SELECT 
  'profiles' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status;

-- Check if events table exists
SELECT 
  'events' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status;

-- Check if food_listings table exists
SELECT 
  'food_listings' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_listings') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status;

-- Show all tables in the current schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
