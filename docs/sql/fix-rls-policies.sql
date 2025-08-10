-- Fix RLS policies for food_listings table
-- Run this in your Supabase SQL Editor

-- First, let's drop ALL existing policies for food_listings
DROP POLICY IF EXISTS "Allow authenticated users to read food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to insert food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to update food listings" ON food_listings;
DROP POLICY IF EXISTS "Allow authenticated users to delete food listings" ON food_listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON food_listings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON food_listings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON food_listings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON food_listings;
DROP POLICY IF EXISTS "Enable all access for admins" ON food_listings;

-- Now create the new policies
CREATE POLICY "Enable read access for all users" ON food_listings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON food_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON food_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON food_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Also create a policy that allows admins to do everything
CREATE POLICY "Enable all access for admins" ON food_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'Admin'
    )
  );
