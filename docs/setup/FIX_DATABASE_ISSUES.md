# 🔧 Fix Database Issues for AI Demand Prediction

## 🚨 **Current Problem**

The seeding script is failing because your `events` table is missing some columns that the AI demand prediction feature needs:

- `event_type` - Type of event (corporate, social, educational, etc.)
- `venue` - Event location
- `expected_meals` - Expected food quantities
- `expected_attendees` - Expected number of attendees

## 🛠️ **Solution Steps**

### Step 1: Check Your Current Database Structure

First, run this SQL query in your Supabase dashboard to see what columns you currently have:

```sql
-- Copy and paste this in your Supabase SQL Editor
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

### Step 2: Add Missing Columns

Run this SQL script in your Supabase dashboard to add the missing columns:

```sql
-- Add missing columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'general';
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT DEFAULT 'Unknown';
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_meals JSONB DEFAULT '{"veg": 0, "nonVeg": 0, "total": 0}'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS expected_attendees INTEGER DEFAULT 100;

-- Update existing events with default values
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
```

### Step 3: Create the Demand Predictions Table

Run this SQL script to create the table for storing AI predictions:

```sql
-- Create demand_predictions table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_demand_predictions_event_id ON demand_predictions(event_id);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_risk_level ON demand_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_demand_predictions_last_updated ON demand_predictions(last_updated);
```

### Step 4: Verify the Setup

Run this query to confirm everything is working:

```sql
-- Verify the setup
SELECT
    'events' as table_name,
    COUNT(*) as row_count
FROM events
UNION ALL
SELECT
    'demand_predictions' as table_name,
    COUNT(*) as row_count
FROM demand_predictions;
```

## 🚀 **Alternative: Use the SQL Scripts**

If you prefer to use the provided SQL files:

1. **Check table structure**: Run `docs/sql/check-events-table-structure.sql`
2. **Add missing columns**: Run `docs/sql/add-missing-event-columns.sql`
3. **Create predictions table**: Run `docs/sql/create-demand-predictions-table.sql`

## 🧪 **Test the Fix**

After running the SQL scripts:

1. **Try seeding again**:

   ```bash
   node scripts/seed-demand-predictions.js
   ```

2. **Check for success messages**:
   ```
   ✅ Successfully inserted X demand predictions!
   🎉 Demand predictions seeded successfully!
   ```

## 🔍 **Troubleshooting**

### If you still get errors:

1. **Check Supabase permissions**: Make sure your service role key has the right permissions
2. **Verify table names**: Ensure your tables are named exactly `events` and `demand_predictions`
3. **Check column types**: Make sure the JSONB columns are properly formatted

### Common Error Messages:

- **"column does not exist"** → Run the column addition script
- **"table does not exist"** → Run the table creation script
- **"permission denied"** → Check your service role key permissions

## 📞 **Need Help?**

If you're still having issues:

1. **Check the Supabase logs** for detailed error messages
2. **Verify your environment variables** are correct
3. **Run the SQL scripts manually** in the Supabase dashboard
4. **Check the table structure** using the verification queries above

## 🎯 **Next Steps**

Once the database is fixed:

1. **Test the seeding script** again
2. **Navigate to the analytics page** in your app
3. **Click the "AI Demand Prediction" tab**
4. **Generate your first AI prediction!**

---

**Happy fixing! 🛠️✨**
