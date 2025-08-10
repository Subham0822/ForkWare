-- Simple migration to create food_listings table
-- Copy and paste this into your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

-- Simple policy to allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read food listings" ON food_listings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simple policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert food listings" ON food_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Simple policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update food listings" ON food_listings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Simple policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete food listings" ON food_listings
  FOR DELETE USING (auth.role() = 'authenticated');
