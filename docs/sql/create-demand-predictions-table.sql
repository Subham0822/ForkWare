-- Create the demand_predictions table for storing AI predictions
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demand_predictions_event_id ON demand_predictions(event_id);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_risk_level ON demand_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_last_updated ON demand_predictions(last_updated);

-- Enable Row Level Security (RLS)
ALTER TABLE demand_predictions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON demand_predictions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON demand_predictions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON demand_predictions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'demand_predictions' 
ORDER BY ordinal_position;
