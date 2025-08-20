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

async function testEventsAPI() {
  try {
    console.log("🧪 Testing Events API...");
    console.log("=========================");

    // Test 1: Check if events exist in database
    console.log("\n📋 Test 1: Checking events in database...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventsError) {
      console.error("❌ Database error:", eventsError.message);
      return;
    }

    if (!events || events.length === 0) {
      console.log("⚠️  No events found in database");
      console.log("💡 Run: node scripts/seed-sample-events.js");
      return;
    }

    console.log(`✅ Found ${events.length} events in database`);
    console.log("\n📊 Sample events:");
    events.slice(0, 3).forEach((event, index) => {
      console.log(
        `  ${index + 1}. ${event.name} (${event.status}) - ${event.date}`
      );
    });

    // Test 2: Check upcoming events specifically
    console.log("\n📋 Test 2: Checking upcoming events...");
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from("events")
      .select("*")
      .eq("status", "upcoming")
      .order("date", { ascending: true });

    if (upcomingError) {
      console.error(
        "❌ Error fetching upcoming events:",
        upcomingError.message
      );
      return;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log("⚠️  No upcoming events found");
      console.log("💡 This might be why the dropdown is empty");
    } else {
      console.log(`✅ Found ${upcomingEvents.length} upcoming events`);
      upcomingEvents.forEach((event, index) => {
        console.log(
          `  ${index + 1}. ${event.name} - ${event.date} at ${event.venue}`
        );
      });
    }

    // Test 3: Check profiles table
    console.log("\n📋 Test 3: Checking profiles table...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .limit(5);

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log("⚠️  No profiles found");
      console.log("💡 This might cause organizer_id issues");
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach((profile, index) => {
        console.log(
          `  ${index + 1}. ${profile.name} (${profile.email}) - ${profile.role}`
        );
      });
    }

    // Test 4: Check for any events with missing organizer_id
    console.log(
      "\n📋 Test 4: Checking for events with missing organizer_id..."
    );
    const { data: eventsWithoutOrganizer, error: organizerError } =
      await supabase
        .from("events")
        .select("id, name, organizer_id")
        .is("organizer_id", null);

    if (organizerError) {
      console.error("❌ Error checking organizer_id:", organizerError.message);
      return;
    }

    if (eventsWithoutOrganizer && eventsWithoutOrganizer.length > 0) {
      console.log(
        `⚠️  Found ${eventsWithoutOrganizer.length} events without organizer_id`
      );
      eventsWithoutOrganizer.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.name} (ID: ${event.id})`);
      });
    } else {
      console.log("✅ All events have organizer_id");
    }

    console.log("\n✨ Events API test completed!");

    if (upcomingEvents && upcomingEvents.length > 0) {
      console.log("💡 The dropdown should show events now");
    } else {
      console.log("💡 No upcoming events found - check the seeding script");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
if (require.main === module) {
  testEventsAPI()
    .then(() => {
      console.log("\n✨ Test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testEventsAPI };
