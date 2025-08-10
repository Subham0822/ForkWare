-- Fixed migration for food_listings table
-- This version references the profiles table instead of auth.users
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS food_listings CASCADE;

-- Create food_listings table with correct foreign key reference
CREATE TABLE food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Changed from auth.users to profiles
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_created_at ON food_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_food_listings_user_id ON food_listings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read food listings
CREATE POLICY "Allow authenticated users to read food listings" ON food_listings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own food listings
CREATE POLICY "Allow authenticated users to insert food listings" ON food_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own food listings
CREATE POLICY "Allow users to update their own food listings" ON food_listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own food listings
CREATE POLICY "Allow users to delete their own food listings" ON food_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to perform all operations
CREATE POLICY "Allow admins full access to food listings" ON food_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_food_listings_updated_at
  BEFORE UPDATE ON food_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created correctly
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- Verify foreign key constraint
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
