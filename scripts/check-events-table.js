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

async function checkEventsTable() {
  try {
    console.log("🔍 Checking Events Table Structure...");
    console.log("=====================================");

    // Try to get table structure using RPC (if available)
    try {
      const { data: structure, error: structureError } = await supabase.rpc(
        "exec_sql",
        {
          sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            CASE 
              WHEN is_nullable = 'NO' THEN 'REQUIRED'
              ELSE 'OPTIONAL'
            END as requirement
          FROM information_schema.columns 
          WHERE table_name = 'events' 
          ORDER BY ordinal_position;
        `,
        }
      );

      if (structure && !structureError) {
        console.log("\n📋 Table Structure:");
        console.log("===================");
        structure.forEach((col) => {
          const status = col.requirement === "REQUIRED" ? "🔴" : "🟢";
          console.log(
            `${status} ${col.column_name}: ${col.data_type} (${col.requirement})`
          );
        });

        // Identify required columns
        const requiredColumns = structure.filter(
          (col) => col.requirement === "REQUIRED"
        );
        console.log(`\n🔴 Total Required Columns: ${requiredColumns.length}`);
        console.log(
          "Required columns:",
          requiredColumns.map((col) => col.column_name).join(", ")
        );
      }
    } catch (rpcError) {
      console.log("⚠️  Could not use RPC, trying alternative approach...");
    }

    // Alternative: Try to insert a minimal event to see what's required
    console.log("\n🧪 Testing minimal event insertion...");

    const testEvent = {
      name: "Test Event",
      date: "2024-12-20",
      start_time: "09:00:00",
      end_time: "17:00:00",
      status: "upcoming",
    };

    const { data: testInsert, error: testError } = await supabase
      .from("events")
      .insert(testEvent)
      .select();

    if (testError) {
      console.log("❌ Test insertion failed:");
      console.log("Error:", testError.message);

      // Try to identify missing fields from error message
      if (testError.message.includes("null value")) {
        const match = testError.message.match(
          /null value in column "([^"]+)" of relation "events"/
        );
        if (match) {
          console.log(`🔴 Missing required field: ${match[1]}`);
        }
      }
    } else {
      console.log("✅ Test insertion successful!");
      console.log("Test event created with ID:", testInsert[0].id);

      // Clean up test event
      await supabase.from("events").delete().eq("id", testInsert[0].id);
      console.log("🧹 Test event cleaned up");
    }

    // Try to get existing events to see structure
    console.log("\n📊 Checking existing events...");
    const { data: existingEvents, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .limit(1);

    if (eventsError) {
      console.log("❌ Could not access events table:", eventsError.message);
    } else if (existingEvents && existingEvents.length > 0) {
      console.log("✅ Found existing events");
      console.log("Sample event structure:", Object.keys(existingEvents[0]));
    } else {
      console.log("ℹ️  No existing events found");
    }
  } catch (error) {
    console.error("❌ Error checking table structure:", error.message);
  }
}

// Run the check
if (require.main === module) {
  checkEventsTable()
    .then(() => {
      console.log("\n✨ Table structure check completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Table structure check failed:", error);
      process.exit(1);
    });
}

module.exports = { checkEventsTable };
