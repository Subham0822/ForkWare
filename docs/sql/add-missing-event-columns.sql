-- Add missing columns to events table for AI demand prediction feature

-- Add event_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_type') THEN
        ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'general';
        RAISE NOTICE 'Added event_type column to events table';
    ELSE
        RAISE NOTICE 'event_type column already exists';
    END IF;
END $$;

-- Add venue column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue') THEN
        ALTER TABLE events ADD COLUMN venue TEXT DEFAULT 'Unknown';
        RAISE NOTICE 'Added venue column to events table';
    ELSE
        RAISE NOTICE 'venue column already exists';
    END IF;
END $$;

-- Add expected_meals column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'expected_meals') THEN
        ALTER TABLE events ADD COLUMN expected_meals JSONB DEFAULT '{"veg": 0, "nonVeg": 0, "total": 0}'::jsonb;
        RAISE NOTICE 'Added expected_meals column to events table';
    ELSE
        RAISE NOTICE 'expected_meals column already exists';
    END IF;
END $$;

-- Add expected_attendees column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'expected_attendees') THEN
        ALTER TABLE events ADD COLUMN expected_attendees INTEGER DEFAULT 100;
        RAISE NOTICE 'Added expected_attendees column to events table';
    ELSE
        RAISE NOTICE 'expected_attendees column already exists';
    END IF;
END $$;

-- Update existing events with default values if they're NULL
UPDATE events 
SET 
    event_type = COALESCE(event_type, 'general'),
    venue = COALESCE(venue, 'Unknown'),
    expected_meals = COALESCE(expected_meals, '{"veg": 0, "nonVeg": 0, "total": 0}'::jsonb),
    expected_attendees = COALESCE(expected_attendees, 100)
WHERE 
    event_type IS NULL 
    OR venue IS NULL 
    OR expected_meals IS NULL 
    OR expected_attendees IS NULL;

-- Show the updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;
