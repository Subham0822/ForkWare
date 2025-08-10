-- Add Food Safety Fields to food_listings table
-- This migration adds comprehensive food safety tracking capabilities

-- Add new safety-related columns
ALTER TABLE food_listings 
ADD COLUMN IF NOT EXISTS temperature VARCHAR(10),
ADD COLUMN IF NOT EXISTS allergens TEXT[], -- Array of allergen strings
ADD COLUMN IF NOT EXISTS preparation_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
ADD COLUMN IF NOT EXISTS storage_conditions TEXT,
ADD COLUMN IF NOT EXISTS last_inspection TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN food_listings.temperature IS 'Food temperature in Celsius (e.g., "4", "60")';
COMMENT ON COLUMN food_listings.allergens IS 'Array of allergens present in the food';
COMMENT ON COLUMN food_listings.preparation_method IS 'Method of food preparation (e.g., "Fresh", "Cooked", "Baked")';
COMMENT ON COLUMN food_listings.safety_rating IS 'Safety rating from 1 (Unsafe) to 5 (Excellent)';
COMMENT ON COLUMN food_listings.storage_conditions IS 'Storage requirements and conditions';
COMMENT ON COLUMN food_listings.last_inspection IS 'Timestamp of last safety inspection';

-- Create index on safety rating for efficient filtering
CREATE INDEX IF NOT EXISTS idx_food_listings_safety_rating ON food_listings(safety_rating);

-- Create index on allergens for efficient allergen-based searches
CREATE INDEX IF NOT EXISTS idx_food_listings_allergens ON food_listings USING GIN(allergens);

-- Create index on last_inspection for tracking inspection schedules
CREATE INDEX IF NOT EXISTS idx_food_listings_last_inspection ON food_listings(last_inspection);

-- Add constraint to ensure temperature is numeric if provided
ALTER TABLE food_listings 
ADD CONSTRAINT check_temperature_format 
CHECK (temperature IS NULL OR temperature ~ '^[0-9]+(\.[0-9]+)?$');

-- Update existing records to set default values
UPDATE food_listings 
SET 
  allergens = ARRAY[]::TEXT[],
  safety_rating = 3,
  last_inspection = created_at
WHERE allergens IS NULL OR safety_rating IS NULL OR last_inspection IS NULL;

-- Create a view for high-priority safety items
CREATE OR REPLACE VIEW high_priority_safety_items AS
SELECT 
  id,
  food_name,
  status,
  safety_rating,
  temperature,
  allergens,
  last_inspection,
  created_at
FROM food_listings 
WHERE 
  (safety_rating IS NOT NULL AND safety_rating <= 2) OR
  (last_inspection IS NULL OR last_inspection < NOW() - INTERVAL '24 hours')
ORDER BY 
  CASE 
    WHEN safety_rating = 1 THEN 1
    WHEN safety_rating = 2 THEN 2
    ELSE 3
  END,
  last_inspection ASC NULLS FIRST;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON high_priority_safety_items TO authenticated;
-- GRANT SELECT ON high_priority_safety_items TO anon;
