const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials for now
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemandPredictionsTable() {
  try {
    console.log("🔍 Checking if demand_predictions table exists...");

    // Try to query the table
    const { data: testQuery, error: testError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (testError) {
      if (testError.message.includes("does not exist")) {
        console.log("⚠️  Table doesn't exist. Creating it...");

        // Create the table using SQL
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
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
            
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_event_id ON demand_predictions(event_id);
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_risk_level ON demand_predictions(risk_level);
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_last_updated ON demand_predictions(last_updated);
          `,
        });

        if (createError) {
          console.error("❌ Failed to create table:", createError.message);
          console.log(
            "💡 You may need to run this SQL manually in Supabase dashboard"
          );
          return;
        }

        console.log("✅ demand_predictions table created successfully!");
      } else {
        console.error("❌ Error checking table:", testError.message);
        return;
      }
    } else {
      console.log("✅ demand_predictions table already exists");
    }

    // Verify the table works
    console.log("\n🔍 Verifying table functionality...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (verifyError) {
      console.error("❌ Table verification failed:", verifyError.message);
    } else {
      console.log(`✅ Table verified! Current records: ${verifyData}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createDemandPredictionsTable();
