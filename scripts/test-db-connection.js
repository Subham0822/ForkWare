const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Environment check:");
console.log("URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("Key:", supabaseKey ? "✅ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("\n🔍 Testing database connection...");

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("events")
      .select("count", { count: "exact", head: true });

    if (testError) {
      console.error("❌ Connection failed:", testError.message);
      return;
    }

    console.log("✅ Database connection successful");
    console.log(`📊 Events count: ${testData}`);

    // Check if demand_predictions table exists
    console.log("\n🔍 Checking demand_predictions table...");
    const { data: predictions, error: predictionsError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (predictionsError) {
      if (predictionsError.message.includes("does not exist")) {
        console.log("⚠️  demand_predictions table does not exist");
        console.log("💡 This is why you're seeing 'No Predictions Yet'");
      } else {
        console.error(
          "❌ Error checking predictions table:",
          predictionsError.message
        );
      }
    } else {
      console.log(
        `✅ demand_predictions table exists with ${predictions} records`
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testConnection();
