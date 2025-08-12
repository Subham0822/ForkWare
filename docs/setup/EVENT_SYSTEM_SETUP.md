# Event Integration System Setup Guide

## Overview

The Event Integration System allows event organizers to register events and track surplus food postings in real-time. This system requires the creation of an `events` table in your Supabase database.

## Prerequisites

- Supabase project set up
- Access to Supabase SQL Editor
- Basic understanding of SQL

## Database Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Click "New Query"

### Step 2: Create Events Table

Copy and paste the following SQL script into the SQL Editor:

```sql
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
```

### Step 3: Execute the Script

1. Click the "Run" button in the SQL Editor
2. Wait for the script to complete successfully
3. You should see a success message

### Step 4: Verify Setup

Run this query to verify the table was created:

```sql
-- Check if events table exists
SELECT
  'events' as table_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events')
    THEN 'EXISTS'
    ELSE 'MISSING'
  END as status;

-- Show table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

## Usage

### Accessing the Event System

1. Navigate to `/admin/events` in your application
2. You should now see the Event Dashboard
3. Click "Register Event" to create your first event

### Features Available

- **Event Registration**: Create events with detailed information
- **Real-time Surplus Posting**: Post surplus food during events
- **Event Management**: View, edit, and finalize events
- **Surplus Tracking**: Monitor food listings grouped by event
- **Post-event Summary**: View statistics and impact metrics

## Troubleshooting

### Common Issues

#### "Events table not found" Error

- Ensure you've run the SQL script in Supabase
- Check that the table was created successfully
- Verify you're connected to the correct database

#### Database Connection Issues

- Check your Supabase environment variables
- Verify your project is active and accessible
- Test the connection using the "Test DB Connection" button

#### Permission Errors

- Ensure your user has the "Admin" role
- Check Row Level Security (RLS) policies if enabled
- Verify database permissions

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Use the "Test DB Connection" button to diagnose issues
3. Verify your Supabase configuration
4. Check the SQL Editor for any error messages

## Next Steps

After setting up the events table:

1. Create your first event
2. Test surplus posting functionality
3. Explore the event management features
4. Configure NGO notifications (optional)
5. Set up automated event finalization (optional)

## Advanced Configuration

For production use, consider:

- Setting up Row Level Security (RLS) policies
- Configuring automated backups
- Setting up monitoring and alerts
- Implementing rate limiting for API endpoints
