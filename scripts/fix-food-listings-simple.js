const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFoodListingsSimple() {
  try {
    console.log("🔍 Checking food_listings table...");
    console.log("==================================");

    // First, let's see what we can query from the table
    const { data: existingData, error: queryError } = await supabase
      .from("food_listings")
      .select("*")
      .limit(1);

    if (queryError) {
      console.log("❌ Error querying food_listings:", queryError.message);

      if (queryError.message.includes("does not exist")) {
        console.log(
          "💡 Table doesn't exist - we'll need to create it manually"
        );
        console.log("🎯 Please run this SQL in your Supabase dashboard:");
        console.log(`
CREATE TABLE food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired', 'donated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_food_listings_event_id ON food_listings(event_id);
CREATE INDEX idx_food_listings_status ON food_listings(status);
CREATE INDEX idx_food_listings_category ON food_listings(category);

ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON food_listings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON food_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON food_listings
  FOR UPDATE USING (auth.role() = 'authenticated');
        `);
        return;
      }
    } else {
      console.log("✅ food_listings table exists and is queryable");
      console.log(
        "📋 Sample data structure:",
        Object.keys(existingData[0] || {})
      );

      // Check if category column exists
      if (existingData[0] && !existingData[0].hasOwnProperty("category")) {
        console.log("⚠️  Missing 'category' column!");
        console.log("🔧 You need to add the category column manually");
        console.log("🎯 Run this SQL in Supabase dashboard:");
        console.log(`
ALTER TABLE food_listings 
ADD COLUMN category TEXT NOT NULL DEFAULT 'General';
        `);
        return;
      }
    }

    // Try to insert a test record to see what happens
    console.log("\n🧪 Testing table functionality...");

    const testRecord = {
      event_id: "00000000-0000-0000-0000-000000000000", // Dummy ID
      food_name: "Test Food",
      category: "Test Category",
      quantity: 1,
      unit: "piece",
      expiry_date: new Date().toISOString(),
      status: "available",
    };

    const { error: testError } = await supabase
      .from("food_listings")
      .insert(testRecord);

    if (testError) {
      console.log("❌ Test insert failed:", testError.message);

      // Clean up the test record if it was partially inserted
      await supabase
        .from("food_listings")
        .delete()
        .eq("food_name", "Test Food");

      console.log("💡 Table needs manual fixing");
      console.log(
        "🎯 Please check the error above and fix the table structure"
      );
    } else {
      console.log("✅ Test insert successful!");

      // Clean up the test record
      await supabase
        .from("food_listings")
        .delete()
        .eq("food_name", "Test Food");

      console.log("🎉 food_listings table is working correctly!");
      console.log(
        "🚀 You can now run: node scripts/populate-events-with-realistic-data.js"
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixFoodListingsSimple();
