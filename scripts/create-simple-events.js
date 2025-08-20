const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleEvents() {
  try {
    console.log("🚀 Creating simple events for analytics...");
    console.log("===========================================");

    // Create simple events without complex dependencies
    const events = [
      // Completed events (for historical analytics)
      {
        name: "Corporate Leadership Summit 2024",
        date: "2024-11-15",
        status: "completed",
        event_type: "corporate",
        venue: "Grand Conference Center",
        start_time: "09:00:00",
        end_time: "17:00:00",
        expected_attendees: 250,
        expected_meals: { veg: 120, non_veg: 130, total: 250 },
        description:
          "Annual leadership conference with networking lunch and dinner",
        organizer_name: "Corporate Events Inc.",
        organizer_contact: "+1-555-0101",
      },
      {
        name: "Community Food Festival 2024",
        date: "2024-11-20",
        status: "completed",
        event_type: "social",
        venue: "Central Park",
        start_time: "12:00:00",
        end_time: "20:00:00",
        expected_attendees: 400,
        expected_meals: { veg: 250, non_veg: 150, total: 400 },
        description:
          "Community celebration with food vendors and entertainment",
        organizer_name: "Community Center",
        organizer_contact: "+1-555-0102",
      },
      {
        name: "Tech Innovation Workshop 2024",
        date: "2024-11-25",
        status: "completed",
        event_type: "educational",
        venue: "Tech Hub Campus",
        start_time: "10:00:00",
        end_time: "16:00:00",
        expected_attendees: 180,
        expected_meals: { veg: 100, non_veg: 80, total: 180 },
        description: "Hands-on workshop with refreshments and networking",
        organizer_name: "Tech Hub Academy",
        organizer_contact: "+1-555-0103",
      },
      {
        name: "Food Safety Conference 2024",
        date: "2024-12-01",
        status: "completed",
        event_type: "educational",
        venue: "Convention Center",
        start_time: "08:00:00",
        end_time: "18:00:00",
        expected_attendees: 300,
        expected_meals: { veg: 180, non_veg: 120, total: 300 },
        description: "International food safety conference with catered meals",
        organizer_name: "Food Safety Institute",
        organizer_contact: "+1-555-0104",
      },
      {
        name: "Startup Networking Mixer 2024",
        date: "2024-12-05",
        status: "completed",
        event_type: "corporate",
        venue: "Innovation Hub",
        start_time: "18:00:00",
        end_time: "22:00:00",
        expected_attendees: 120,
        expected_meals: { veg: 70, non_veg: 50, total: 120 },
        description: "Evening networking event with appetizers and drinks",
        organizer_name: "Tech Hub Academy",
        organizer_contact: "+1-555-0103",
      },

      // Upcoming events (for future planning)
      {
        name: "Winter Business Summit 2025",
        date: "2025-01-20",
        status: "upcoming",
        event_type: "corporate",
        venue: "Business Center",
        start_time: "09:00:00",
        end_time: "17:00:00",
        expected_attendees: 200,
        expected_meals: { veg: 100, non_veg: 100, total: 200 },
        description: "Strategic planning summit with full catering service",
        organizer_name: "Corporate Events Inc.",
        organizer_contact: "+1-555-0101",
      },
      {
        name: "Spring Community Picnic 2025",
        date: "2025-02-15",
        status: "upcoming",
        event_type: "social",
        venue: "Community Gardens",
        start_time: "11:00:00",
        end_time: "19:00:00",
        expected_attendees: 350,
        expected_meals: { veg: 200, non_veg: 150, total: 350 },
        description: "Family-friendly picnic with food trucks and activities",
        organizer_name: "Community Center",
        organizer_contact: "+1-555-0102",
      },
      {
        name: "AI in Food Safety Symposium 2025",
        date: "2025-02-20",
        status: "upcoming",
        event_type: "educational",
        venue: "Research Institute",
        start_time: "08:30:00",
        end_time: "17:30:00",
        expected_attendees: 250,
        expected_meals: { veg: 150, non_veg: 100, total: 250 },
        description: "Cutting-edge symposium on AI applications in food safety",
        organizer_name: "Food Safety Institute",
        organizer_contact: "+1-555-0104",
      },
    ];

    console.log("\n📝 Creating events...");
    const createdEvents = [];

    for (const event of events) {
      const { data: createdEvent, error: eventError } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();

      if (eventError) {
        console.log(`⚠️  Event ${event.name}: ${eventError.message}`);
      } else {
        console.log(`✅ Event: ${event.name} (${event.status})`);
        createdEvents.push(createdEvent);
      }
    }

    if (createdEvents.length === 0) {
      console.log(
        "❌ No events were created. Cannot proceed with food listings."
      );
      return;
    }

    console.log(`\n🎉 Successfully created ${createdEvents.length} events!`);

    // Now let's try to create food listings
    console.log("\n🍽️  Creating food listings for completed events...");

    const completedEvents = createdEvents.filter(
      (e) => e.status === "completed"
    );

    for (const event of completedEvents) {
      const foodItems = [
        {
          name: "Vegetarian Pasta",
          category: "Main Course",
          quantity: Math.floor(Math.random() * 40) + 30,
          unit: "portions",
        },
        {
          name: "Chicken Curry",
          category: "Main Course",
          quantity: Math.floor(Math.random() * 35) + 25,
          unit: "portions",
        },
        {
          name: "Fresh Salad",
          category: "Side Dish",
          quantity: Math.floor(Math.random() * 50) + 40,
          unit: "bowls",
        },
        {
          name: "Rice Pilaf",
          category: "Side Dish",
          quantity: Math.floor(Math.random() * 60) + 50,
          unit: "portions",
        },
        {
          name: "Fruit Platter",
          category: "Dessert",
          quantity: Math.floor(Math.random() * 25) + 20,
          unit: "platters",
        },
        {
          name: "Bread Rolls",
          category: "Bread",
          quantity: Math.floor(Math.random() * 80) + 60,
          unit: "pieces",
        },
        {
          name: "Water Bottles",
          category: "Beverage",
          quantity: Math.floor(Math.random() * 100) + 80,
          unit: "bottles",
        },
      ];

      const listings = foodItems.map((item) => ({
        event_id: event.id,
        food_name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: Math.random() > 0.3 ? "picked_up" : "expired", // 70% picked up, 30% expired
        created_at: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }));

      const { error: listingsError } = await supabase
        .from("food_listings")
        .insert(listings);

      if (listingsError) {
        console.log(
          `⚠️  Failed to create listings for ${event.name}: ${listingsError.message}`
        );
      } else {
        console.log(
          `✅ Created ${listings.length} food listings for ${event.name}`
        );
      }
    }

    // Create sample food listings for upcoming events
    console.log("\n🍽️  Creating sample food listings for upcoming events...");

    const upcomingEvents = createdEvents.filter((e) => e.status === "upcoming");

    for (const event of upcomingEvents) {
      const sampleListings = [
        {
          event_id: event.id,
          food_name: "Vegetarian Meals",
          category: "Main Course",
          quantity: Math.floor(event.expected_meals?.veg || 50),
          unit: "portions",
          expiry_date: new Date(event.date).toISOString(),
          status: "available",
          created_at: new Date().toISOString(),
        },
        {
          event_id: event.id,
          food_name: "Non-Vegetarian Meals",
          category: "Main Course",
          quantity: Math.floor(event.expected_meals?.non_veg || 50),
          unit: "portions",
          expiry_date: new Date(event.date).toISOString(),
          status: "available",
          created_at: new Date().toISOString(),
        },
      ];

      const { error: sampleError } = await supabase
        .from("food_listings")
        .insert(sampleListings);

      if (sampleError) {
        console.log(
          `⚠️  Failed to create sample listings for ${event.name}: ${sampleError.message}`
        );
      } else {
        console.log(`✅ Created sample listings for ${event.name}`);
      }
    }

    console.log("\n🎉 Events and food listings created successfully!");
    console.log("📊 Your analytics page should now show:");
    console.log("   • Realistic event attendance numbers");
    console.log("   • Food saved and picked up metrics");
    console.log("   • Efficiency calculations");
    console.log("   • Carbon and water savings");

    console.log("\n🚀 Check your Analytics page to see the improvements!");
  } catch (error) {
    console.error("❌ Error creating events:", error.message);
  }
}

createSimpleEvents();
