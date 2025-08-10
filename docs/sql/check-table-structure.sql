-- Check and fix food_listings table structure
-- Run this in your Supabase SQL Editor

-- First, let's see what the current table structure looks like
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- If expiry_date is DATE type instead of TEXT, let's fix it
ALTER TABLE food_listings 
ALTER COLUMN expiry_date TYPE TEXT;

-- Also make sure all text fields are properly set
ALTER TABLE food_listings 
ALTER COLUMN food_name TYPE TEXT,
ALTER COLUMN quantity TYPE TEXT,
ALTER COLUMN pickup_location TYPE TEXT,
ALTER COLUMN status TYPE TEXT;

-- Check the result
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;
