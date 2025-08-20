-- Complete Setup for AI Demand Prediction Feature
-- Run this script in your Supabase SQL Editor

-- Step 1: Add missing columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT 'Unknown';
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_meals JSONB DEFAULT '{"veg": 0, "nonVeg": 0, "total": 0}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_attendees INTEGER DEFAULT 100;

-- Step 2: Update existing events with default values
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

-- Step 3: Create demand_predictions table
CREATE TABLE IF NOT EXISTS demand_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    predicted_surplus JSONB NOT NULL,
    factors JSONB NOT NULL,
    recommendations TEXT[] NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demand_predictions_event_id ON demand_predictions(event_id);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_risk_level ON demand_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_last_updated ON demand_predictions(last_updated);

-- Step 5: Insert sample events (if none exist)
INSERT INTO events (name, date, start_time, end_time, status, event_type, venue, expected_meals, expected_attendees, description)
SELECT * FROM (VALUES
    ('Tech Conference 2024', '2024-12-20', '09:00:00', '17:00:00', 'upcoming', 'corporate', 'Convention Center', '{"veg": 80, "nonVeg": 120, "total": 200}'::jsonb, 250, 'Annual technology conference with networking lunch'),
    ('Community Food Festival', '2024-12-25', '12:00:00', '20:00:00', 'upcoming', 'social', 'City Park', '{"veg": 150, "nonVeg": 100, "total": 250}'::jsonb, 300, 'Local food festival celebrating community diversity'),
    ('University Career Fair', '2024-12-28', '10:00:00', '16:00:00', 'upcoming', 'educational', 'University Campus', '{"veg": 60, "nonVeg": 90, "total": 150}'::jsonb, 200, 'Career fair for graduating students and employers')
) AS v(name, date, start_time, end_time, status, event_type, venue, expected_meals, expected_attendees, description)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name = v.name);

-- Step 6: Insert sample demand predictions
INSERT INTO demand_predictions (event_id, predicted_surplus, factors, recommendations, risk_level)
SELECT 
    e.id,
    '{"totalKg": 15.5, "confidence": 0.75, "breakdown": {"veg": 6.2, "nonVeg": 6.2, "desserts": 2.3, "beverages": 0.8}}'::jsonb,
    '{"historicalWaste": 0.15, "attendanceVariation": 0.12, "weatherImpact": 0.05, "eventTypeFactor": 0.10, "seasonalAdjustment": 0.08}'::jsonb,
    ARRAY['Monitor attendance patterns closely', 'Implement flexible portion control', 'Prepare backup distribution channels'],
    'medium'
FROM events e 
WHERE e.status = 'upcoming' 
AND NOT EXISTS (SELECT 1 FROM demand_predictions dp WHERE dp.event_id = e.id)
LIMIT 3;

-- Step 7: Verify the setup
SELECT 
    'events' as table_name,
    COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
    'demand_predictions' as table_name,
    COUNT(*) as row_count
FROM demand_predictions;

-- Step 8: Show sample data
SELECT 
    e.name as event_name,
    e.event_type,
    e.expected_attendees,
    dp.predicted_surplus->>'totalKg' as predicted_surplus_kg,
    dp.risk_level,
    dp.recommendations
FROM events e
LEFT JOIN demand_predictions dp ON e.id = dp.event_id
WHERE e.status = 'upcoming'
ORDER BY e.date;
