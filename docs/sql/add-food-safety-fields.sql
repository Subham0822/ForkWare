-- Add missing food safety and event integration columns to food_listings table
-- Run this in your Supabase SQL Editor after creating the events table

-- Add food safety columns
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS temperature VARCHAR(50);
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS preparation_method TEXT;
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5);
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS storage_conditions TEXT;
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS last_inspection TIMESTAMP WITH TIME ZONE;

-- Add event integration column (if not already added)
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS event_id UUID;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_listings_event_id ON food_listings(event_id);
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_user_id ON food_listings(user_id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'food_listings' 
ORDER BY ordinal_position;

-- Test insert to verify structure
-- (This will fail if there are RLS policies, but it tests the schema)
-- INSERT INTO food_listings (user_id, food_name, quantity, expiry_date, pickup_location, status) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'test', '1', NOW() + INTERVAL '1 hour', 'test', 'available');
