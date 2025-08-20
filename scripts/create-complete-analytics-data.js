const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompleteAnalyticsData() {
  try {
    console.log("🚀 Creating complete analytics data...");
    console.log("======================================");

    // Step 1: Create organizer profiles if they don't exist
    console.log("\n1️⃣ Setting up organizer profiles...");

    const organizerProfiles = [
      {
        id: "org-001",
        full_name: "Corporate Events Inc.",
        email: "events@corporate.com",
        phone: "+1-555-0101",
        organization: "Corporate Events Inc.",
      },
      {
        id: "org-002",
        full_name: "Community Center",
        email: "info@communitycenter.org",
        phone: "+1-555-0102",
        organization: "Community Center",
      },
      {
        id: "org-003",
        full_name: "Tech Hub Academy",
        email: "contact@techhub.edu",
        phone: "+1-555-0103",
        organization: "Tech Hub Academy",
      },
      {
        id: "org-004",
        full_name: "Food Safety Institute",
        email: "info@foodsafety.org",
        phone: "+1-555-0104",
        organization: "Food Safety Institute",
      },
    ];

    for (const profile of organizerProfiles) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profile, { onConflict: "id" });

      if (profileError) {
        console.log(
          `⚠️  Profile ${profile.full_name}: ${profileError.message}`
        );
      } else {
        console.log(`✅ Profile: ${profile.full_name}`);
      }
    }

    // Step 2: Create comprehensive events
    console.log("\n2️⃣ Creating comprehensive events...");

    const events = [
      // Completed events (for historical analytics)
      {
        name: "Corporate Leadership Summit 2024",
        date: "2024-11-15",
        status: "completed",
        event_type: "corporate",
        venue: "Grand Conference Center",
        start_time: "2024-11-15T09:00:00Z",
        end_time: "2024-11-15T17:00:00Z",
        expected_attendees: 250,
        expected_meals: { veg: 120, non_veg: 130, total: 250 },
        description:
          "Annual leadership conference with networking lunch and dinner",
        organizer_id: "org-001",
        organizer_name: "Corporate Events Inc.",
        organizer_contact: "+1-555-0101",
      },
      {
        name: "Community Food Festival 2024",
        date: "2024-11-20",
        status: "completed",
        event_type: "social",
        venue: "Central Park",
        start_time: "2024-11-20T12:00:00Z",
        end_time: "2024-11-20T20:00:00Z",
        expected_attendees: 400,
        expected_meals: { veg: 250, non_veg: 150, total: 400 },
        description:
          "Community celebration with food vendors and entertainment",
        organizer_id: "org-002",
        organizer_name: "Community Center",
        organizer_contact: "+1-555-0102",
      },
      {
        name: "Tech Innovation Workshop 2024",
        date: "2024-11-25",
        status: "completed",
        event_type: "educational",
        venue: "Tech Hub Campus",
        start_time: "2024-11-25T10:00:00Z",
        end_time: "2024-11-25T16:00:00Z",
        expected_attendees: 180,
        expected_meals: { veg: 100, non_veg: 80, total: 180 },
        description: "Hands-on workshop with refreshments and networking",
        organizer_id: "org-003",
        organizer_name: "Tech Hub Academy",
        organizer_contact: "+1-555-0103",
      },
      {
        name: "Food Safety Conference 2024",
        date: "2024-12-01",
        status: "completed",
        event_type: "educational",
        venue: "Convention Center",
        start_time: "2024-12-01T08:00:00Z",
        end_time: "2024-12-01T18:00:00Z",
        expected_attendees: 300,
        expected_meals: { veg: 180, non_veg: 120, total: 300 },
        description: "International food safety conference with catered meals",
        organizer_id: "org-004",
        organizer_name: "Food Safety Institute",
        organizer_contact: "+1-555-0104",
      },
      {
        name: "Startup Networking Mixer 2024",
        date: "2024-12-05",
        status: "completed",
        event_type: "corporate",
        venue: "Innovation Hub",
        start_time: "2024-12-05T18:00:00Z",
        end_time: "2024-12-05T22:00:00Z",
        expected_attendees: 120,
        expected_meals: { veg: 70, non_veg: 50, total: 120 },
        description: "Evening networking event with appetizers and drinks",
        organizer_id: "org-003",
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
        start_time: "2025-01-20T09:00:00Z",
        end_time: "2025-01-20T17:00:00Z",
        expected_attendees: 200,
        expected_meals: { veg: 100, non_veg: 100, total: 200 },
        description: "Strategic planning summit with full catering service",
        organizer_id: "org-001",
        organizer_name: "Corporate Events Inc.",
        organizer_contact: "+1-555-0101",
      },
      {
        name: "Spring Community Picnic 2025",
        date: "2025-02-15",
        status: "upcoming",
        event_type: "social",
        venue: "Community Gardens",
        start_time: "2025-02-15T11:00:00Z",
        end_time: "2025-02-15T19:00:00Z",
        expected_attendees: 350,
        expected_meals: { veg: 200, non_veg: 150, total: 350 },
        description: "Family-friendly picnic with food trucks and activities",
        organizer_id: "org-002",
        organizer_name: "Community Center",
        organizer_contact: "+1-555-0102",
      },
      {
        name: "AI in Food Safety Symposium 2025",
        date: "2025-02-20",
        status: "upcoming",
        event_type: "educational",
        venue: "Research Institute",
        start_time: "2025-02-20T08:30:00Z",
        end_time: "2025-02-20T17:30:00Z",
        expected_attendees: 250,
        expected_meals: { veg: 150, non_veg: 100, total: 250 },
        description: "Cutting-edge symposium on AI applications in food safety",
        organizer_id: "org-004",
        organizer_name: "Food Safety Institute",
        organizer_contact: "+1-555-0104",
      },
    ];

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

    // Step 3: Create food listings for completed events (for analytics)
    console.log("\n3️⃣ Creating food listings for completed events...");

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

    // Step 4: Create sample food listings for upcoming events
    console.log("\n4️⃣ Creating sample food listings for upcoming events...");

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

    // Step 5: Create some demand predictions for demonstration
    console.log("\n5️⃣ Creating sample demand predictions...");

    const { data: demandPredictionsTable, error: dpCheckError } = await supabase
      .from("demand_predictions")
      .select("count", { count: "exact", head: true });

    if (dpCheckError && dpCheckError.message.includes("does not exist")) {
      console.log(
        "ℹ️  demand_predictions table doesn't exist - skipping predictions"
      );
    } else {
      // Create sample predictions for upcoming events
      for (const event of upcomingEvents.slice(0, 3)) {
        const prediction = {
          event_id: event.id,
          predicted_surplus: Math.floor(Math.random() * 50) + 20,
          factors: JSON.stringify({
            historical_attendance: "Based on similar events",
            seasonal_trends: "Spring events typically have 85% attendance",
            weather_forecast: "Expected good weather",
          }),
          recommendations: "Prepare 15% extra food for unexpected attendees",
          risk_level: "low",
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        const { error: predError } = await supabase
          .from("demand_predictions")
          .upsert(prediction, { onConflict: "event_id" });

        if (predError) {
          console.log(
            `⚠️  Failed to create prediction for ${event.name}: ${predError.message}`
          );
        } else {
          console.log(`✅ Created demand prediction for ${event.name}`);
        }
      }
    }

    console.log("\n🎉 Complete analytics data created successfully!");
    console.log("📊 Your analytics page should now show:");
    console.log("   • Realistic event attendance numbers");
    console.log("   • Food saved and picked up metrics");
    console.log("   • Efficiency calculations");
    console.log("   • Carbon and water savings");
    console.log("   • Sample AI demand predictions");

    console.log("\n🚀 Check your Analytics page to see the improvements!");
  } catch (error) {
    console.error("❌ Error creating analytics data:", error.message);
  }
}

createCompleteAnalyticsData();
