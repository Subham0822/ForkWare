-- Test inserting a food listing manually
-- Run this in your Supabase SQL Editor

-- First, let's see if we can insert a test record
INSERT INTO food_listings (
  user_id,
  food_name,
  quantity,
  expiry_date,
  pickup_location,
  status,
  image_url
) VALUES (
  'caafe5d5-f2cf-4775-b097-c66db2334782',
  'Test Food',
  '1 unit',
  'in 2 hours',
  'Test Location',
  'available',
  NULL
) RETURNING *;

-- If that works, let's see what's in the table
SELECT * FROM food_listings ORDER BY created_at DESC LIMIT 5;

