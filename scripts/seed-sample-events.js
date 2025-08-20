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

async function seedSampleEvents() {
  try {
    console.log("🚀 Starting sample events seeding...");

    // First, we need to create or get an organizer profile
    console.log("👤 Setting up organizer profile...");

    // Try to get an existing profile first
    const { data: existingProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .limit(1);

    let organizerId;
    let organizerName = "";
    let organizerEmail = "";

    if (profilesError || !existingProfiles || existingProfiles.length === 0) {
      // No profiles exist, create a sample organizer profile
      console.log("   📝 Creating sample organizer profile...");

      const nowIso = new Date().toISOString();
      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          email: "organizer@forkware.com",
          name: "Sample Event Organizer",
          role: "canteen",
          verified: true,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select();

      if (createProfileError) {
        throw new Error(
          `Cannot create organizer profile: ${createProfileError.message}`
        );
      }
      organizerId = newProfile[0].id;
      organizerName = newProfile[0].name;
      organizerEmail = newProfile[0].email;
      console.log(`   ✅ Created organizer profile with ID: ${organizerId}`);
    } else {
      organizerId = existingProfiles[0].id;
      organizerName = existingProfiles[0].name || "Organizer";
      organizerEmail = existingProfiles[0].email || "organizer@example.com";
      console.log(`   ✅ Using existing profile as organizer: ${organizerId}`);
    }

    // Check if events table exists and has the right structure
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("events")
      .select("id")
      .limit(1);

    if (tableCheckError) {
      console.error(
        "❌ Error accessing events table:",
        tableCheckError.message
      );
      return;
    }

    // Sample events with different characteristics for testing AI predictions
    const sampleEvents = [
      {
        name: "Tech Conference 2024",
        date: "2024-12-20",
        start_time: "09:00:00",
        end_time: "17:00:00",
        status: "upcoming",
        venue: "Convention Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 80, non_veg: 120, total: 200 },
        expected_attendees: 250,
        description: "Annual technology conference with networking lunch",
      },
      {
        name: "Community Food Festival",
        date: "2024-12-25",
        start_time: "12:00:00",
        end_time: "20:00:00",
        status: "upcoming",
        venue: "City Park",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 150, non_veg: 100, total: 250 },
        expected_attendees: 300,
        description: "Local food festival celebrating community diversity",
      },
      {
        name: "University Career Fair",
        date: "2024-12-28",
        start_time: "10:00:00",
        end_time: "16:00:00",
        status: "upcoming",
        venue: "University Campus",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "educational",
        expected_meals: { veg: 60, non_veg: 90, total: 150 },
        expected_attendees: 200,
        description: "Career fair for graduating students and employers",
      },
      {
        name: "Holiday Corporate Dinner",
        date: "2024-12-31",
        start_time: "19:00:00",
        end_time: "23:00:00",
        status: "upcoming",
        venue: "Grand Hotel",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 40, non_veg: 60, total: 100 },
        expected_attendees: 120,
        description: "End-of-year celebration for company employees",
      },
      {
        name: "New Year's Community Potluck",
        date: "2025-01-01",
        start_time: "18:00:00",
        end_time: "22:00:00",
        status: "upcoming",
        venue: "Community Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 100, non_veg: 80, total: 180 },
        expected_attendees: 220,
        description: "Community potluck to celebrate the new year",
      },
      {
        name: "Startup Networking Lunch",
        date: "2025-01-05",
        start_time: "12:30:00",
        end_time: "15:30:00",
        status: "upcoming",
        venue: "Innovation Hub",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "corporate",
        expected_meals: { veg: 30, non_veg: 45, total: 75 },
        expected_attendees: 90,
        description: "Networking event for startup founders and investors",
      },
      {
        name: "Cultural Food Exchange",
        date: "2025-01-10",
        start_time: "14:00:00",
        end_time: "19:00:00",
        status: "upcoming",
        venue: "Cultural Center",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 120, non_veg: 100, total: 220 },
        expected_attendees: 280,
        description: "Cultural food exchange celebrating diversity",
      },
      {
        name: "Student Leadership Workshop",
        date: "2025-01-15",
        start_time: "09:30:00",
        end_time: "16:30:00",
        status: "upcoming",
        venue: "Student Union",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "educational",
        expected_meals: { veg: 45, non_veg: 55, total: 100 },
        expected_attendees: 120,
        description: "Leadership development workshop for student leaders",
      },
    ];

    console.log(`📅 Creating ${sampleEvents.length} sample events...`);

    // Insert events
    const { data: insertedEvents, error: insertError } = await supabase
      .from("events")
      .insert(sampleEvents)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert events: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted ${insertedEvents.length} events!`);

    // Show summary
    console.log("\n📊 Sample Events Summary:");
    console.log("==========================");

    insertedEvents.forEach((event, index) => {
      console.log(`\n🎯 ${event.name}`);
      console.log(`   📅 Date: ${event.date}`);
      console.log(`   🕐 Time: ${event.start_time} - ${event.end_time}`);
      console.log(`   🏢 Type: ${event.event_type}`);
      console.log(`   📍 Venue: ${event.venue}`);
      console.log(
        `   👤 Organizer: ${event.organizer_name} (${event.organizer_contact})`
      );
      console.log(`   🍽️  Expected Meals: ${event.expected_meals.total}`);
      console.log(`   👥 Expected Attendees: ${event.expected_attendees}`);
      console.log(`   📝 Status: ${event.status}`);
    });

    console.log("\n🎉 Sample events seeded successfully!");
    console.log("💡 Now you can test the AI demand prediction feature!");
    console.log("🚀 Run: node scripts/seed-demand-predictions.js");

    // Also create some completed events for historical data
    console.log("\n🔄 Creating some completed events for historical data...");

    const completedEvents = [
      {
        name: "Summer Tech Meetup",
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
        description: "Monthly tech meetup with pizza and networking",
      },
      {
        name: "Fall Community Picnic",
        date: "2024-10-20",
        start_time: "11:00:00",
        end_time: "16:00:00",
        status: "completed",
        venue: "Central Park",
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_contact: organizerEmail,
        event_type: "social",
        expected_meals: { veg: 80, non_veg: 70, total: 150 },
        expected_attendees: 180,
        description: "Annual community picnic with local food vendors",
      },
    ];

    const { data: completedInserted, error: completedError } = await supabase
      .from("events")
      .insert(completedEvents)
      .select();

    if (completedError) {
      console.log(
        "⚠️  Could not create completed events:",
        completedError.message
      );
    } else {
      console.log(
        `✅ Created ${completedInserted.length} completed events for historical data`
      );
    }
  } catch (error) {
    console.error("❌ Error seeding sample events:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the seeding
if (require.main === module) {
  seedSampleEvents()
    .then(() => {
      console.log("\n✨ Event seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Event seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedSampleEvents };
