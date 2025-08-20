const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDemandPredictionsTable() {
  try {
    console.log("🔍 Checking demand_predictions table...");
    console.log("================================");

    // Check if table exists by trying to query it
    const { data: tableCheck, error: tableError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (tableError) {
      if (tableError.message.includes("does not exist")) {
        console.log("⚠️  demand_predictions table does not exist");
        console.log("💡 Creating table...");

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
            "💡 You may need to run the SQL manually in Supabase dashboard"
          );
          return;
        }

        console.log("✅ demand_predictions table created successfully");
      } else {
        console.error("❌ Error checking table:", tableError.message);
        return;
      }
    } else {
      console.log("✅ demand_predictions table exists");
    }

    // Check if there are any existing predictions
    const { data: predictions, error: predictionsError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (predictionsError) {
      console.error("❌ Error checking predictions:", predictionsError.message);
      return;
    }

    console.log(`📊 Found ${predictions} existing predictions`);

    // Check table structure
    console.log("\n🔍 Checking table structure...");
    const { data: columns, error: columnsError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'demand_predictions'
          ORDER BY ordinal_position;
        `,
      }
    );

    if (columnsError) {
      console.log("⚠️  Could not check table structure (this is normal)");
    } else if (columns) {
      console.log("📋 Table columns:");
      columns.forEach((col) => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} (${
            col.is_nullable === "YES" ? "nullable" : "not null"
          })`
        );
      });
    }

    console.log("\n✨ Demand predictions table check completed!");

    if (tableError && tableError.message.includes("does not exist")) {
      console.log("💡 Run this script again to verify the table was created");
    } else {
      console.log("💡 The table is ready for storing AI predictions");
    }
  } catch (error) {
    console.error("❌ Check failed:", error.message);
  }
}

// Run the check
if (require.main === module) {
  checkDemandPredictionsTable()
    .then(() => {
      console.log("\n✨ Check completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Check failed:", error);
      process.exit(1);
    });
}

module.exports = { checkDemandPredictionsTable };
