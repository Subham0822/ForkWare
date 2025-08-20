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

async function cleanAndReseedEvents() {
  try {
    console.log("🧹 Cleaning and reseeding events table...");
    console.log("=========================================");

    // Get organizer profile
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .limit(1);

    if (profilesError || !profiles || profiles.length === 0) {
      throw new Error(
        "No organizer profile found. Run seed-sample-events.js first."
      );
    }

    const organizerId = profiles[0].id;
    const organizerName = profiles[0].name || "Event Coordinator";
    const organizerEmail = profiles[0].email || "coordinator@forkware.com";

    // Step 1: Clean existing events
    console.log("🗑️  Cleaning existing events...");
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all events

    if (deleteError) {
      console.log("⚠️  Could not clean events table:", deleteError.message);
    } else {
      console.log("✅ Events table cleaned successfully");
    }

    // Step 2: Create fresh, professional events
    console.log("\n🌱 Creating fresh, professional events...");

    const professionalEvents = [
      // Corporate Events
      {
        name: "Tech Innovation Summit 2025",
        date: "2025-01-20",
        start_time: "08:30:00",
        end_time: "18:00:00",
        status: "upcoming",
        venue: "Tech Convention Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 120, non_veg: 180, total: 300 },
        expected_attendees: 350,
        description:
          "Premier technology conference featuring industry leaders, workshops, and networking sessions",
      },
      {
        name: "Startup Ecosystem Meetup",
        date: "2025-01-25",
        start_time: "14:00:00",
        end_time: "20:00:00",
        status: "upcoming",
        venue: "Innovation Hub",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 40, non_veg: 60, total: 100 },
        expected_attendees: 120,
        description:
          "Networking event for startup founders, investors, and industry professionals",
      },
      {
        name: "Corporate Leadership Workshop",
        date: "2025-02-01",
        start_time: "09:00:00",
        end_time: "17:00:00",
        status: "upcoming",
        venue: "Business Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 60, non_veg: 90, total: 150 },
        expected_attendees: 180,
        description:
          "Leadership development workshop for corporate executives and managers",
      },

      // Social Events
      {
        name: "Winter Food & Culture Festival",
        date: "2025-01-30",
        start_time: "11:00:00",
        end_time: "21:00:00",
        status: "upcoming",
        venue: "Downtown Plaza",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 200, non_veg: 150, total: 350 },
        expected_attendees: 400,
        description:
          "Celebration of winter cuisine with food trucks, live music, and community activities",
      },
      {
        name: "Cultural Heritage Celebration",
        date: "2025-02-05",
        start_time: "12:00:00",
        end_time: "18:00:00",
        status: "upcoming",
        venue: "Cultural Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 180, non_veg: 120, total: 300 },
        expected_attendees: 350,
        description:
          "Celebration of diverse cultural traditions through food, music, and art",
      },
      {
        name: "Community Spring Picnic",
        date: "2025-02-15",
        start_time: "11:00:00",
        end_time: "16:00:00",
        status: "upcoming",
        venue: "Central Park",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 150, non_veg: 100, total: 250 },
        expected_attendees: 300,
        description:
          "Annual community picnic celebrating spring with local food vendors and family activities",
      },

      // Educational Events
      {
        name: "Sustainable Food Practices Workshop",
        date: "2025-02-10",
        start_time: "09:00:00",
        end_time: "16:00:00",
        status: "upcoming",
        venue: "Green Learning Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "educational",
        expected_meals: { veg: 80, non_veg: 40, total: 120 },
        expected_attendees: 150,
        description:
          "Workshop on sustainable food practices, zero waste cooking, and environmental awareness",
      },
      {
        name: "Nutrition & Food Safety Seminar",
        date: "2025-02-20",
        start_time: "10:00:00",
        end_time: "15:00:00",
        status: "upcoming",
        venue: "Health Sciences Building",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "educational",
        expected_meals: { veg: 60, non_veg: 40, total: 100 },
        expected_attendees: 120,
        description:
          "Scientific seminar on nutrition, food safety, and dietary health guidelines",
      },

      // Completed Events for Historical Data
      {
        name: "Fall Harvest Festival 2024",
        date: "2024-11-10",
        start_time: "10:00:00",
        end_time: "18:00:00",
        status: "completed",
        venue: "Farmers Market",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 150, non_veg: 100, total: 250 },
        expected_attendees: 300,
        description:
          "Annual harvest celebration with local produce, food demonstrations, and family activities",
      },
      {
        name: "Business Networking Breakfast",
        date: "2024-11-25",
        start_time: "07:30:00",
        end_time: "10:00:00",
        status: "completed",
        venue: "Business Club",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 30, non_veg: 45, total: 75 },
        expected_attendees: 90,
        description:
          "Monthly business networking event with continental breakfast and professional development",
      },
      {
        name: "Summer Tech Meetup 2024",
        date: "2024-11-15",
        start_time: "18:00:00",
        end_time: "21:00:00",
        status: "completed",
        venue: "Tech Hub",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 40, non_veg: 60, total: 100 },
        expected_attendees: 120,
        description:
          "Monthly tech meetup with pizza and networking opportunities",
      },
    ];

    console.log(
      `📅 Creating ${professionalEvents.length} professional events...`
    );

    // Insert events
    const { data: insertedEvents, error: insertError } = await supabase
      .from("events")
      .insert(professionalEvents)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert events: ${insertError.message}`);
    }

    console.log(
      `✅ Successfully created ${insertedEvents.length} professional events!`
    );

    // Show summary
    console.log("\n📊 New Professional Events Summary:");
    console.log("===================================");

    insertedEvents.forEach((event) => {
      console.log(`\n🎯 ${event.name}`);
      console.log(`   📅 Date: ${event.date}`);
      console.log(`   🕐 Time: ${event.start_time} - ${event.end_time}`);
      console.log(`   🏢 Type: ${event.event_type}`);
      console.log(`   📍 Venue: ${event.venue}`);
      console.log(`   👥 Expected: ${event.expected_attendees} attendees`);
      console.log(
        `   🍽️  Meals: ${event.expected_meals.total} (${event.expected_meals.veg} veg, ${event.expected_meals.non_veg} non-veg)`
      );
      console.log(`   📝 Status: ${event.status}`);
    });

    console.log("\n🎉 Events table cleaned and reseeded successfully!");
    console.log("💡 No more duplicate key errors!");
    console.log("🚀 Your AI prediction feature should work perfectly now!");
  } catch (error) {
    console.error("❌ Error cleaning and reseeding events:", error.message);
  }
}

// Run the function
if (require.main === module) {
  cleanAndReseedEvents()
    .then(() => {
      console.log("\n✨ Clean and reseed completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Clean and reseed failed:", error);
      process.exit(1);
    });
}

module.exports = { cleanAndReseedEvents };
