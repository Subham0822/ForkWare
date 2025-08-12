-- Complete Database Setup for ForkWare Event Integration System
-- Run this in your Supabase SQL Editor

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Students' CHECK (role IN ('Students', 'Canteen / Event', 'NGO', 'Admin')),
  verified BOOLEAN DEFAULT false,
  desired_role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create food_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Food Safety Fields
  temperature TEXT,
  allergens TEXT[],
  preparation_method TEXT,
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  storage_conditions TEXT,
  last_inspection TEXT,
  -- Event Integration Fields
  event_id UUID -- Will be set up after events table is created
);

-- Step 3: Create events table for Event Integration System
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  venue_address TEXT,
  venue_lat DECIMAL(10, 8),
  venue_lng DECIMAL(11, 8),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organizer_name VARCHAR(255) NOT NULL,
  organizer_contact VARCHAR(255) NOT NULL,
  expected_meals JSONB NOT NULL DEFAULT '{"veg": 0, "non_veg": 0, "total": 0}',
  food_vendor VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  expected_attendees INTEGER,
  food_serving_time TIME,
  surplus_management_contact VARCHAR(255),
  auto_notify_ngos BOOLEAN DEFAULT true,
  ngo_auto_reserve_minutes INTEGER DEFAULT 0,
  default_surplus_expiry_minutes INTEGER DEFAULT 180,
  notify_radius_km INTEGER DEFAULT 5,
  trusted_ngo_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add event_id foreign key to food_listings table
ALTER TABLE food_listings 
ADD CONSTRAINT IF NOT EXISTS fk_food_listings_event_id 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_food_listings_user_id ON food_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_created_at ON food_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_food_listings_event_id ON food_listings(event_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue);

-- Step 6: Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create triggers to automatically update updated_at
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_food_listings_updated_at 
  BEFORE UPDATE ON food_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Insert a default admin user if profiles table is empty
INSERT INTO profiles (id, name, email, role, verified)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'System Admin',
  'admin@forkware.com',
  'Admin',
  true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'Admin');

-- Step 9: Enable Row Level Security (RLS) - Optional, uncomment if needed
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies - Optional, uncomment if needed
-- -- Profiles policies
-- CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
-- );

-- -- Food listings policies
-- CREATE POLICY "Allow authenticated users to read food listings" ON food_listings
--   FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated users to insert food listings" ON food_listings
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Allow users to update own food listings" ON food_listings
--   FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Allow admins full access to food listings" ON food_listings
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
--   );

-- -- Events policies
-- CREATE POLICY "Users can view events" ON events FOR SELECT USING (true);
-- CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
-- );

-- Step 11: Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Check table structures
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('profiles', 'food_listings', 'events')
ORDER BY tablename;

-- Check if default admin user exists
SELECT 
  name,
  email,
  role,
  verified
FROM profiles 
WHERE role = 'Admin';
