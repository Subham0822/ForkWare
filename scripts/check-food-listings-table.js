const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFoodListingsTable() {
  try {
    console.log("🔍 Checking food_listings table...");
    console.log("==================================");

    // Check if food_listings table exists
    const { data: listings, error: listingsError } = await supabase
      .from("food_listings")
      .select("count", { count: "exact", head: true });

    if (listingsError) {
      if (listingsError.message.includes("does not exist")) {
        console.log("⚠️  food_listings table does not exist!");
        console.log("💡 This is why your analytics show 0 values");
        console.log("🔧 Creating the table...");

        // Create the table using SQL
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS food_listings (
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
            
            CREATE INDEX IF NOT EXISTS idx_food_listings_event_id ON food_listings(event_id);
            CREATE INDEX IF NOT EXISTS idx_food_listings_status ON food_listings(status);
            CREATE INDEX IF NOT EXISTS idx_food_listings_category ON food_listings(category);
            
            -- Enable RLS
            ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
            
            -- Create RLS policies
            CREATE POLICY "Enable read access for all users" ON food_listings
              FOR SELECT USING (true);
            
            CREATE POLICY "Enable insert for authenticated users" ON food_listings
              FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
            CREATE POLICY "Enable update for authenticated users" ON food_listings
              FOR UPDATE USING (auth.role() = 'authenticated');
          `,
        });

        if (createError) {
          console.error("❌ Failed to create table:", createError.message);
          console.log(
            "💡 You may need to run this SQL manually in Supabase dashboard"
          );
          return;
        }

        console.log("✅ food_listings table created successfully!");
      } else {
        console.error("❌ Error checking table:", listingsError.message);
        return;
      }
    } else {
      console.log(`✅ food_listings table exists with ${listings} records`);
    }

    // Verify the table works
    console.log("\n🔍 Verifying table functionality...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("food_listings")
      .select("count", { count: "exact", head: true });

    if (verifyError) {
      console.error("❌ Table verification failed:", verifyError.message);
    } else {
      console.log(`✅ Table verified! Current records: ${verifyData}`);
    }

    console.log("\n🎯 Next steps:");
    console.log("1. Run: node scripts/populate-events-with-realistic-data.js");
    console.log("2. This will create sample food listings for your events");
    console.log(
      "3. Your analytics will then show realistic numbers instead of 0s"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkFoodListingsTable();
