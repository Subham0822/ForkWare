-- Create events table (minimal version)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  venue_address TEXT,
  organizer_id UUID NOT NULL,
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

-- Add event_id column to food_listings if it doesn't exist
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS event_id UUID;

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_event_id ON food_listings(event_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify creation
SELECT 'Events table created successfully!' as status;
