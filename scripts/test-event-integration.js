// Test script to verify event integration is working
// Usage: node scripts/test-event-integration.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
  console.log(
    'Please run with: $env:NEXT_PUBLIC_SUPABASE_URL="YOUR_URL"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY"; node scripts/test-event-integration.js'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEventIntegration() {
  try {
    console.log("🧪 Testing Event Integration...\n");

    // Test 1: Check if events table exists and has data
    console.log("1. Checking events table...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .limit(5);

    if (eventsError) {
      console.error("❌ Error accessing events table:", eventsError.message);
      return;
    }

    console.log(`✅ Events table accessible`);
    console.log(`📅 Found ${events.length} events in database`);

    if (events.length === 0) {
      console.log("💡 No events found. You need to run the seeding script.");
      console.log("   Run: node scripts/seed-events.js");
      return;
    }

    console.log("\n📋 Sample events:");
    events.forEach((event, index) => {
      console.log(
        `  ${index + 1}. ${event.name} - ${event.date} - ${event.venue}`
      );
    });

    // Test 2: Check if food_listings table has event_id column
    console.log("\n2. Checking food_listings table structure...");
    const { data: foodListings, error: foodError } = await supabase
      .from("food_listings")
      .select("*")
      .limit(5);

    if (foodError) {
      console.error(
        "❌ Error accessing food_listings table:",
        foodError.message
      );
      return;
    }

    console.log(`✅ food_listings table accessible`);
    console.log(`📊 Found ${foodListings.length} food listings in database`);

    if (foodListings.length === 0) {
      console.log(
        "💡 No food listings found. You need to run the seeding script."
      );
      console.log("   Run: node scripts/seed-food-listings.js");
      return;
    }

    // Check if event_id column exists
    const sampleListing = foodListings[0];
    if (sampleListing.hasOwnProperty("event_id")) {
      console.log("✅ event_id column exists in food_listings table");
    } else {
      console.log("❌ event_id column missing from food_listings table");
      console.log("   You need to run the database migration first.");
      return;
    }

    // Test 3: Check the new approach (fetch events separately and combine)
    console.log("\n3. Testing event enrichment approach...");

    // First get food listings
    const { data: foodListingsForTest, error: foodError2 } = await supabase
      .from("food_listings")
      .select("*")
      .limit(5);

    if (foodError2) {
      console.error("❌ Error fetching food listings:", foodError2.message);
      return;
    }

    // Then get events for those listings
    const eventIds = foodListingsForTest
      .map((listing) => listing.event_id)
      .filter((id) => id)
      .filter((id, index, arr) => arr.indexOf(id) === index);

    let enrichedListings = foodListingsForTest.map((listing) => ({
      ...listing,
      events: null,
    }));

    if (eventIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, name, venue, date")
        .in("id", eventIds);

      if (!eventsError && events) {
        const eventsMap = new Map(events.map((event) => [event.id, event]));
        enrichedListings = foodListingsForTest.map((listing) => ({
          ...listing,
          events: listing.event_id
            ? eventsMap.get(listing.event_id) || null
            : null,
        }));
      }
    }

    console.log("✅ Event enrichment successful");
    console.log(
      `📊 Retrieved ${enrichedListings.length} listings with event info`
    );

    // Show the results
    console.log("\n📋 Sample listings with event info:");
    enrichedListings.forEach((listing, index) => {
      const eventInfo = listing.events
        ? `${listing.events.name} at ${listing.events.venue}`
        : "No event";

      console.log(`  ${index + 1}. ${listing.food_name} - Event: ${eventInfo}`);
    });

    // Test 4: Check event distribution
    console.log("\n4. Checking event distribution...");
    const eventDistribution = {};
    enrichedListings.forEach((listing) => {
      if (listing.events) {
        const eventName = listing.events.name;
        eventDistribution[eventName] = (eventDistribution[eventName] || 0) + 1;
      } else {
        eventDistribution["No Event"] =
          (eventDistribution["No Event"] || 0) + 1;
      }
    });

    console.log("📊 Event distribution:");
    Object.entries(eventDistribution).forEach(([eventName, count]) => {
      console.log(`  ${eventName}: ${count} listings`);
    });

    console.log("\n🎉 Event integration test completed successfully!");
    console.log(
      "\n💡 The app should now display proper event names instead of 'Unknown Event'"
    );
  } catch (error) {
    console.error("❌ Event integration test failed:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the test
testEventIntegration();
