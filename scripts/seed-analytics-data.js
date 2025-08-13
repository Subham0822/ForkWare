// Seed comprehensive analytics data with multiple events and food listings
// This script creates events and food listings to populate the analytics dashboard

const { createClient } = require("@supabase/supabase-js");

// Check for environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
  console.log(
    'Please run with: $env:NEXT_PUBLIC_SUPABASE_URL="YOUR_URL"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY"; node scripts/seed-analytics-data.js'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedAnalyticsData() {
  try {
    console.log("🌱 Starting to seed comprehensive analytics data...");

    // First, let's create some events
    const events = [
      {
        name: "University Food Festival 2025",
        date: "2025-01-15",
        status: "completed",
        description:
          "Annual university food festival with surplus food collection",
        venue: "Main Campus",
        venue_address: "University Main Campus, Central Plaza",
        start_time: "10:00:00",
        end_time: "18:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "University Events Committee",
        organizer_contact: "events@university.edu",
        expected_meals: { veg: 300, non_veg: 200, total: 500 },
        expected_attendees: 500,
        created_at: new Date().toISOString(),
      },
      {
        name: "Corporate Lunch Program",
        date: "2025-01-20",
        status: "completed",
        description: "Corporate office lunch program with daily surplus",
        venue: "Downtown Office Complex",
        venue_address: "123 Business District, Downtown",
        start_time: "12:00:00",
        end_time: "14:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "Corporate Catering",
        organizer_contact: "catering@corporate.com",
        expected_meals: { veg: 120, non_veg: 80, total: 200 },
        expected_attendees: 200,
        created_at: new Date().toISOString(),
      },
      {
        name: "Hospital Cafeteria Surplus",
        date: "2025-01-25",
        status: "ongoing",
        description: "Daily hospital cafeteria food redistribution",
        venue: "City General Hospital",
        venue_address: "456 Health Street, Medical District",
        start_time: "18:00:00",
        end_time: "20:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "Hospital Food Services",
        organizer_contact: "foodservices@hospital.com",
        expected_meals: { veg: 60, non_veg: 40, total: 100 },
        expected_attendees: 100,
        created_at: new Date().toISOString(),
      },
      {
        name: "School Lunch Initiative",
        date: "2025-02-01",
        status: "ongoing",
        description: "School lunch program with surplus food collection",
        venue: "Central High School",
        venue_address: "789 Education Avenue, School District",
        start_time: "14:00:00",
        end_time: "16:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "School Nutrition Program",
        organizer_contact: "nutrition@school.edu",
        expected_meals: { veg: 180, non_veg: 120, total: 300 },
        expected_attendees: 300,
        created_at: new Date().toISOString(),
      },
      {
        name: "Restaurant Week Surplus",
        date: "2025-02-10",
        status: "upcoming",
        description: "Restaurant week with surplus food collection",
        venue: "Various Restaurant Locations",
        venue_address: "Multiple locations across the city",
        start_time: "20:00:00",
        end_time: "22:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "Restaurant Association",
        organizer_contact: "info@restaurantweek.com",
        expected_meals: { veg: 90, non_veg: 60, total: 150 },
        expected_attendees: 150,
        created_at: new Date().toISOString(),
      },
      {
        name: "Community Center Meals",
        date: "2025-02-15",
        status: "upcoming",
        description: "Community center daily meal program",
        venue: "Community Center",
        venue_address: "321 Community Drive, Residential Area",
        start_time: "17:00:00",
        end_time: "19:00:00",
        organizer_id: "caafe5d5-f2cf-4775-b097-c66db2334782", // Subham (Admin)
        organizer_name: "Community Services",
        organizer_contact: "services@community.org",
        expected_meals: { veg: 48, non_veg: 32, total: 80 },
        expected_attendees: 80,
        created_at: new Date().toISOString(),
      },
    ];

    console.log(`📅 Creating ${events.length} events...`);

    // Insert events
    const { data: insertedEvents, error: eventError } = await supabase
      .from("events")
      .insert(events)
      .select();

    if (eventError) {
      throw new Error(`Failed to insert events: ${eventError.message}`);
    }

    console.log(`✅ Successfully created ${insertedEvents.length} events!`);

    // Now create food listings for each event
    const foodListings = [];

    // Event 1: University Food Festival (Completed - High efficiency)
    const event1 = insertedEvents[0];
    const event1Foods = [
      {
        food_name: "Vegetable Curry",
        quantity: "100 plates",
        description: "Fresh aromatic vegetable curry",
        pickup_location: "Main Campus Kitchen",
        expiry_date: "2025-01-15T20:00:00.000Z",
        status: "picked_up",
        food_type: "veg",
        allergens: ["onions"],
        temperature: "Hot",
        preparation_method: "Fresh cooked",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        event_id: event1.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Chicken Biryani",
        quantity: "80 plates",
        description: "Spiced chicken biryani",
        pickup_location: "Main Campus Kitchen",
        expiry_date: "2025-01-15T20:00:00.000Z",
        status: "picked_up",
        food_type: "non_veg",
        allergens: ["nuts"],
        temperature: "Hot",
        preparation_method: "Fresh cooked",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        event_id: event1.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Fresh Fruit Salad",
        quantity: "50 portions",
        description: "Mixed seasonal fruits",
        pickup_location: "Main Campus Kitchen",
        expiry_date: "2025-01-15T20:00:00.000Z",
        status: "picked_up",
        food_type: "veg",
        allergens: [],
        temperature: "Cold",
        preparation_method: "Fresh cut",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        event_id: event1.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Bread Rolls",
        quantity: "120 pieces",
        description: "Fresh baked bread rolls",
        pickup_location: "Main Campus Kitchen",
        expiry_date: "2025-01-15T20:00:00.000Z",
        status: "expired",
        food_type: "veg",
        allergens: ["gluten"],
        temperature: "Room temperature",
        preparation_method: "Fresh baked",
        safety_rating: 4,
        storage_conditions: "Room temperature",
        event_id: event1.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ];

    // Event 2: Corporate Lunch Program (Completed - Medium efficiency)
    const event2 = insertedEvents[1];
    const event2Foods = [
      {
        food_name: "Sandwich Platters",
        quantity: "60 plates",
        description: "Assorted sandwich platters",
        pickup_location: "Office Kitchen",
        expiry_date: "2025-01-20T16:00:00.000Z",
        status: "picked_up",
        food_type: "veg",
        allergens: ["gluten", "dairy"],
        temperature: "Cold",
        preparation_method: "Fresh prepared",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        event_id: event2.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Pasta Salad",
        quantity: "40 bowls",
        description: "Fresh pasta salad with vegetables",
        pickup_location: "Office Kitchen",
        expiry_date: "2025-01-20T16:00:00.000Z",
        status: "picked_up",
        food_type: "veg",
        allergens: ["gluten"],
        temperature: "Cold",
        preparation_method: "Fresh prepared",
        safety_rating: 4,
        storage_conditions: "Refrigerated",
        event_id: event2.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Chicken Wings",
        quantity: "30 plates",
        description: "Spicy chicken wings",
        pickup_location: "Office Kitchen",
        expiry_date: "2025-01-20T16:00:00.000Z",
        status: "expired",
        food_type: "non_veg",
        allergens: ["dairy"],
        temperature: "Hot",
        preparation_method: "Fresh cooked",
        safety_rating: 4,
        storage_conditions: "Keep warm",
        event_id: event2.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ];

    // Event 3: Hospital Cafeteria (Ongoing - Mixed status)
    const event3 = insertedEvents[2];
    const event3Foods = [
      {
        food_name: "Soup of the Day",
        quantity: "45 bowls",
        description: "Daily soup special",
        pickup_location: "Hospital Cafeteria",
        expiry_date: "2025-01-26T22:00:00.000Z",
        status: "available",
        food_type: "veg",
        allergens: ["celery"],
        temperature: "Hot",
        preparation_method: "Fresh prepared",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        event_id: event3.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Grilled Fish",
        quantity: "25 plates",
        description: "Fresh grilled fish with herbs",
        pickup_location: "Hospital Cafeteria",
        expiry_date: "2025-01-26T22:00:00.000Z",
        status: "picked_up",
        food_type: "non_veg",
        allergens: ["fish"],
        temperature: "Hot",
        preparation_method: "Fresh grilled",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        event_id: event3.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Vegetable Stir Fry",
        quantity: "35 plates",
        description: "Fresh vegetable stir fry",
        pickup_location: "Hospital Cafeteria",
        expiry_date: "2025-01-26T22:00:00.000Z",
        status: "available",
        food_type: "veg",
        allergens: ["soy"],
        temperature: "Hot",
        preparation_method: "Fresh cooked",
        safety_rating: 4,
        storage_conditions: "Keep warm",
        event_id: event3.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ];

    // Event 4: School Lunch Initiative (Ongoing - High availability)
    const event4 = insertedEvents[3];
    const event4Foods = [
      {
        food_name: "Pizza Slices",
        quantity: "100 slices",
        description: "Fresh pizza slices",
        pickup_location: "School Kitchen",
        expiry_date: "2025-02-02T18:00:00.000Z",
        status: "available",
        food_type: "veg",
        allergens: ["gluten", "dairy"],
        temperature: "Hot",
        preparation_method: "Fresh baked",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        event_id: event4.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Milk Cartons",
        quantity: "80 cartons",
        description: "Fresh milk cartons",
        pickup_location: "School Kitchen",
        expiry_date: "2025-02-02T18:00:00.000Z",
        status: "available",
        food_type: "veg",
        allergens: ["dairy"],
        temperature: "Cold",
        preparation_method: "Fresh packaged",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        event_id: event4.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Apple Slices",
        quantity: "60 portions",
        description: "Fresh cut apple slices",
        pickup_location: "School Kitchen",
        expiry_date: "2025-02-02T18:00:00.000Z",
        status: "available",
        food_type: "veg",
        allergens: [],
        temperature: "Cold",
        preparation_method: "Fresh cut",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        event_id: event4.id,
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ];

    // Event 5: Restaurant Week (Upcoming - No food yet)
    const event5 = insertedEvents[4];
    // No food listings for upcoming events

    // Event 6: Community Center (Upcoming - No food yet)
    const event6 = insertedEvents[5];
    // No food listings for upcoming events

    // Combine all food listings
    foodListings.push(
      ...event1Foods,
      ...event2Foods,
      ...event3Foods,
      ...event4Foods
    );

    console.log(`🍽️  Adding ${foodListings.length} food listings...`);

    // Insert food listings
    const { data: insertedFoodListings, error: foodError } = await supabase
      .from("food_listings")
      .insert(foodListings)
      .select();

    if (foodError) {
      throw new Error(`Failed to insert food listings: ${foodError.message}`);
    }

    console.log(
      `✅ Successfully added ${insertedFoodListings.length} food listings!`
    );

    // Show summary
    console.log("\n📊 Analytics Data Summary:");
    console.log("==========================");

    insertedEvents.forEach((event) => {
      const eventFoods = foodListings.filter((f) => f.event_id === event.id);
      const pickedUp = eventFoods.filter(
        (f) => f.status === "picked_up"
      ).length;
      const available = eventFoods.filter(
        (f) => f.status === "available"
      ).length;
      const expired = eventFoods.filter((f) => f.status === "expired").length;

      console.log(`\n🎯 ${event.name} (${event.status})`);
      console.log(`   📅 Date: ${event.date}`);
      console.log(`   📍 Venue: ${event.venue}`);
      console.log(`   🍽️  Total Food Items: ${eventFoods.length}`);
      console.log(`   ✅ Picked Up: ${pickedUp}`);
      console.log(`   🔄 Available: ${available}`);
      console.log(`   ⏰ Expired: ${expired}`);

      if (eventFoods.length > 0) {
        const efficiency = Math.round((pickedUp / eventFoods.length) * 100);
        console.log(`   📈 Efficiency: ${efficiency}%`);
      }
    });

    console.log("\n🎉 Analytics data seeded successfully!");
    console.log(
      "💡 Now you can view meaningful charts and statistics in the analytics dashboard!"
    );
    console.log("\n🚀 Next steps:");
    console.log("   1. Check the analytics page to see the new data");
    console.log("   2. View charts showing food distribution by event");
    console.log("   3. Analyze efficiency rankings and status distributions");
  } catch (error) {
    console.error("❌ Error seeding analytics data:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the seeding
seedAnalyticsData();
