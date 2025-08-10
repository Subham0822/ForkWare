-- Create food_listings table
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_created_at ON food_listings(created_at);

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
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_food_listings_updated_at 
  BEFORE UPDATE ON food_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
