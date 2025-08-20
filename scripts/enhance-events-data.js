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

async function enhanceEventsData() {
  try {
    console.log("🚀 Starting events data enhancement...");
    console.log("=====================================");

    // Get all existing events
    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("*");

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      console.log("ℹ️  No events found to enhance");
      return;
    }

    console.log(`📊 Found ${events.length} events to enhance`);

    // Enhanced data for each event type
    const enhancedData = {
      corporate: {
        mealMultiplier: 1.2,
        attendanceMultiplier: 1.1,
        description:
          "Professional corporate event with networking opportunities",
        venue: "Business Center",
        startTime: "09:00:00",
        endTime: "17:00:00",
      },
      social: {
        mealMultiplier: 1.5,
        attendanceMultiplier: 1.3,
        description: "Community social gathering with food and entertainment",
        venue: "Community Hall",
        startTime: "18:00:00",
        endTime: "22:00:00",
      },
      educational: {
        mealMultiplier: 1.0,
        attendanceMultiplier: 1.0,
        description:
          "Educational workshop with learning materials and refreshments",
        venue: "Learning Center",
        startTime: "10:00:00",
        endTime: "16:00:00",
      },
      general: {
        mealMultiplier: 1.1,
        attendanceMultiplier: 1.0,
        description: "General event with food service and activities",
        venue: "Event Space",
        startTime: "14:00:00",
        endTime: "20:00:00",
      },
    };

    let updatedCount = 0;
    const updatePromises = events.map(async (event) => {
      const eventType = event.event_type || "general";
      const config = enhancedData[eventType] || enhancedData.general;

      // Calculate realistic values based on event type
      const baseAttendance = Math.max(event.expected_attendees || 100, 50);
      const realisticAttendance = Math.round(
        baseAttendance * config.attendanceMultiplier
      );

      const baseMeals = Math.max(event.expected_meals?.total || 100, 50);
      const realisticMeals = Math.round(baseMeals * config.mealMultiplier);

      // Calculate meal breakdown
      const vegRatio =
        eventType === "corporate" ? 0.4 : eventType === "social" ? 0.6 : 0.5;
      const vegMeals = Math.round(realisticMeals * vegRatio);
      const nonVegMeals = realisticMeals - vegMeals;

      const updateData = {
        expected_attendees: realisticAttendance,
        expected_meals: {
          veg: vegMeals,
          non_veg: nonVegMeals,
          total: realisticMeals,
        },
        description: event.description || config.description,
        venue: event.venue || config.venue,
        start_time: event.start_time || config.startTime,
        end_time: event.end_time || config.endTime,
        organizer_name: event.organizer_name || "Event Coordinator",
        organizer_contact:
          event.organizer_contact || "coordinator@forkware.com",
      };

      // Update the event
      const { error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", event.id);

      if (updateError) {
        console.log(
          `⚠️  Failed to update event ${event.name}: ${updateError.message}`
        );
        return false;
      }

      console.log(`✅ Enhanced: ${event.name}`);
      console.log(`   👥 Attendance: ${realisticAttendance}`);
      console.log(
        `   🍽️  Meals: ${realisticMeals} (${vegMeals} veg, ${nonVegMeals} non-veg)`
      );
      console.log(`   📍 Venue: ${updateData.venue}`);
      console.log(
        `   🕐 Time: ${updateData.start_time} - ${updateData.end_time}`
      );

      updatedCount++;
      return true;
    });

    await Promise.all(updatePromises);

    console.log(
      `\n🎉 Successfully enhanced ${updatedCount} out of ${events.length} events!`
    );
    console.log("💡 Events now have realistic data for better AI predictions");
  } catch (error) {
    console.error("❌ Error enhancing events data:", error.message);
  }
}

// Run the enhancement
if (require.main === module) {
  enhanceEventsData()
    .then(() => {
      console.log("\n✨ Events enhancement completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Events enhancement failed:", error);
      process.exit(1);
    });
}

module.exports = { enhanceEventsData };
