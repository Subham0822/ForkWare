const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAIPredictionAPI() {
  try {
    console.log("🧪 Testing AI Prediction API...");
    console.log("=================================");

    // Step 1: Check if we have events
    console.log("\n1️⃣ Checking for available events...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, date, status")
      .eq("status", "upcoming")
      .limit(5);

    if (eventsError) {
      console.error("❌ Error fetching events:", eventsError.message);
      return;
    }

    if (!events || events.length === 0) {
      console.log("⚠️  No upcoming events found");
      return;
    }

    console.log(`✅ Found ${events.length} upcoming events:`);
    events.forEach((event) => {
      console.log(`   - ${event.name} (${event.date}) - ID: ${event.id}`);
    });

    // Step 2: Check if demand_predictions table exists
    console.log("\n2️⃣ Checking demand_predictions table...");
    const { data: predictions, error: predictionsError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (predictionsError) {
      if (predictionsError.message.includes("does not exist")) {
        console.log("❌ demand_predictions table does not exist!");
        console.log("💡 This is why you're seeing 'No Predictions Yet'");
        console.log(
          "🔧 Run the SQL script in docs/sql/create-demand-predictions-table.sql"
        );
        return;
      } else {
        console.error(
          "❌ Error checking predictions table:",
          predictionsError.message
        );
        return;
      }
    }

    console.log(
      `✅ demand_predictions table exists with ${predictions} records`
    );

    // Step 3: Test the API endpoint (if running locally)
    console.log("\n3️⃣ Testing API endpoint...");
    console.log(
      "💡 Make sure your Next.js app is running on http://localhost:3000"
    );

    try {
      const response = await fetch(
        "http://localhost:3000/api/ai/demand-prediction"
      );
      if (response.ok) {
        const data = await response.json();
        console.log("✅ API endpoint working:", data);
      } else {
        console.log(`⚠️  API returned status: ${response.status}`);
      }
    } catch (apiError) {
      console.log("⚠️  Could not test API endpoint (app may not be running)");
    }

    console.log("\n🎯 Summary:");
    console.log("✅ Events table: Working");
    if (
      predictionsError &&
      predictionsError.message.includes("does not exist")
    ) {
      console.log(
        "❌ demand_predictions table: Missing (this is the problem!)"
      );
      console.log("🔧 Solution: Run the SQL script in Supabase dashboard");
    } else {
      console.log("✅ demand_predictions table: Working");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAIPredictionAPI();
