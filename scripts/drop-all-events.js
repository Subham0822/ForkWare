const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function dropAllEvents() {
  try {
    console.log("🗑️  Dropping all events...");
    console.log("=============================");

    // First, let's see how many events we have
    const { data: events, error: countError } = await supabase
      .from("events")
      .select("id, name, date, status");

    if (countError) {
      console.log("❌ Error fetching events:", countError.message);
      return;
    }

    if (!events || events.length === 0) {
      console.log("ℹ️  No events found to delete");
      return;
    }

    console.log(`📊 Found ${events.length} events to delete:`);
    events.forEach((event, index) => {
      console.log(
        `  ${index + 1}. ${event.name} (${event.date}) - ${event.status}`
      );
    });

    console.log("\n⚠️  WARNING: This will permanently delete ALL events!");
    console.log(
      "💡 Related data (food_listings, demand_predictions) will also be affected"
    );

    // Delete all events
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except dummy ID

    if (deleteError) {
      console.log("❌ Error deleting events:", deleteError.message);
      return;
    }

    console.log("✅ Successfully deleted all events!");

    // Verify deletion
    const { data: remainingEvents, error: verifyError } = await supabase
      .from("events")
      .select("count", { count: "exact", head: true });

    if (verifyError) {
      console.log("⚠️  Could not verify deletion");
    } else {
      console.log(`📊 Remaining events: ${remainingEvents}`);
    }

    console.log("\n🎯 Next steps:");
    console.log("1. You can now create fresh events with clean data");
    console.log("2. Run seeding scripts to populate new events");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

dropAllEvents();
