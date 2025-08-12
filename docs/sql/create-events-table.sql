-- Create events table for Event Integration System
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

-- Add event_id column to food_listings table if it doesn't exist
ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue);
CREATE INDEX IF NOT EXISTS idx_food_listings_event_id ON food_listings(event_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample events for testing (optional)
-- INSERT INTO events (name, description, date, start_time, end_time, venue, organizer_id, organizer_name, organizer_contact, expected_meals) 
-- VALUES 
--   ('TechFest 2025', 'Annual technology festival', '2025-03-15', '09:00', '18:00', 'Main Auditorium', '00000000-0000-0000-0000-000000000000', 'Tech Committee', 'tech@example.com', '{"veg": 500, "non_veg": 300, "total": 800}'),
--   ('Cultural Night', 'Cultural performances and dinner', '2025-03-20', '18:00', '23:00', 'Open Air Theater', '00000000-0000-0000-0000-000000000000', 'Cultural Committee', 'cultural@example.com', '{"veg": 200, "non_veg": 150, "total": 350}');

-- Grant necessary permissions (adjust based on your RLS setup)
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view events" ON events FOR SELECT USING (true);
-- CREATE POLICY "Admins can manage events" ON events FOR ALL USING (auth.jwt() ->> 'role' = 'Admin');
