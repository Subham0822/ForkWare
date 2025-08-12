// Seed sample food listings for demo purposes
// This will add food listings to existing events so analytics show data

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
    'Please run with: $env:NEXT_PUBLIC_SUPABASE_URL="YOUR_URL"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY"; node scripts/seed-food-listings.js'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedFoodListings() {
  try {
    console.log("🌱 Starting to seed food listings...");

    // First, get existing events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, date, start_time, end_time")
      .order("date", { ascending: false });

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      console.log(
        "❌ No events found. Please run seed-events.js first to create events."
      );
      return;
    }

    console.log(`📅 Found ${events.length} events to add food listings to`);

    // Sample food listings data
    const sampleFoodListings = [
      // Event 1: TechFest 2025
      {
        event_id: events[0]?.id,
        food_name: "Veg Biryani",
        quantity: "50 plates",
        description: "Fresh aromatic biryani with vegetables",
        pickup_location: "Main Canteen",
        expiry_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        status: "available",
        food_type: "veg",
        allergens: ["nuts"],
        temperature: "Hot",
        preparation_method: "Steamed rice with spices",
        safety_rating: 5,
        storage_conditions: "Keep warm, covered",
        user_id: null, // Will be set to event organizer
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[0]?.id,
        food_name: "Chicken Curry",
        quantity: "30 plates",
        description: "Spicy chicken curry with rice",
        pickup_location: "Main Canteen",
        expiry_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        status: "available",
        food_type: "non_veg",
        allergens: ["dairy"],
        temperature: "Hot",
        preparation_method: "Slow cooked in spices",
        safety_rating: 5,
        storage_conditions: "Keep warm, covered",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[0]?.id,
        food_name: "Fruit Salad",
        quantity: "40 portions",
        description: "Fresh mixed fruits with honey",
        pickup_location: "Main Canteen",
        expiry_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        status: "picked_up",
        food_type: "veg",
        allergens: [],
        temperature: "Cold",
        preparation_method: "Fresh cut fruits",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        user_id: null,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        event_id: events[0]?.id,
        food_name: "Sandwiches",
        quantity: "25 pieces",
        description: "Veg sandwiches with cheese and vegetables",
        pickup_location: "Main Canteen",
        expiry_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Expired 1 hour ago
        status: "expired",
        food_type: "veg",
        allergens: ["gluten", "dairy"],
        temperature: "Room temperature",
        preparation_method: "Fresh made sandwiches",
        safety_rating: 4,
        storage_conditions: "Room temperature",
        user_id: null,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },

      // Event 2: Cultural Night
      {
        event_id: events[1]?.id,
        food_name: "Pasta",
        quantity: "35 plates",
        description: "Creamy pasta with vegetables",
        pickup_location: "Cultural Hall",
        expiry_date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
        status: "available",
        food_type: "veg",
        allergens: ["gluten", "dairy"],
        temperature: "Hot",
        preparation_method: "Boiled pasta with cream sauce",
        safety_rating: 4,
        storage_conditions: "Keep warm",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[1]?.id,
        food_name: "Fish Curry",
        quantity: "20 plates",
        description: "Spicy fish curry with rice",
        pickup_location: "Cultural Hall",
        expiry_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: "available",
        food_type: "non_veg",
        allergens: ["fish"],
        temperature: "Hot",
        preparation_method: "Fish cooked in spices",
        safety_rating: 5,
        storage_conditions: "Keep warm",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[1]?.id,
        food_name: "Desserts",
        quantity: "45 pieces",
        description: "Assorted sweets and pastries",
        pickup_location: "Cultural Hall",
        expiry_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
        status: "picked_up",
        food_type: "veg",
        allergens: ["eggs", "dairy"],
        temperature: "Room temperature",
        preparation_method: "Fresh baked",
        safety_rating: 5,
        storage_conditions: "Room temperature",
        user_id: null,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      },

      // Event 3: Conference
      {
        event_id: events[2]?.id,
        food_name: "Coffee & Tea",
        quantity: "100 cups",
        description: "Hot beverages for conference attendees",
        pickup_location: "Conference Center",
        expiry_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
        status: "available",
        food_type: "veg",
        allergens: [],
        temperature: "Hot",
        preparation_method: "Fresh brewed",
        safety_rating: 5,
        storage_conditions: "Keep hot",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[2]?.id,
        food_name: "Snacks",
        quantity: "80 packets",
        description: "Assorted chips and crackers",
        pickup_location: "Conference Center",
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: "available",
        food_type: "veg",
        allergens: ["gluten"],
        temperature: "Room temperature",
        preparation_method: "Packaged snacks",
        safety_rating: 5,
        storage_conditions: "Room temperature",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        event_id: events[2]?.id,
        food_name: "Lunch Boxes",
        quantity: "60 boxes",
        description: "Complete meal boxes with rice, curry, and sides",
        pickup_location: "Conference Center",
        expiry_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Expired 2 hours ago
        status: "expired",
        food_type: "veg",
        allergens: ["nuts"],
        temperature: "Room temperature",
        preparation_method: "Packaged meals",
        safety_rating: 4,
        storage_conditions: "Room temperature",
        user_id: null,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
    ];

    // Filter out listings without valid event_id
    const validListings = sampleFoodListings.filter(
      (listing) => listing.event_id
    );

    if (validListings.length === 0) {
      console.log("❌ No valid event IDs found for food listings");
      return;
    }

    console.log(`🍽️  Adding ${validListings.length} food listings...`);

    // Insert food listings
    const { data: insertedListings, error: insertError } = await supabase
      .from("food_listings")
      .insert(validListings)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert food listings: ${insertError.message}`);
    }

    console.log(
      `✅ Successfully added ${insertedListings.length} food listings!`
    );

    // Show summary
    console.log("\n📊 Food Listings Summary:");
    const eventSummary = {};

    insertedListings.forEach((listing) => {
      const eventName =
        events.find((e) => e.id === listing.event_id)?.name || "Unknown Event";
      if (!eventSummary[eventName]) {
        eventSummary[eventName] = { available: 0, picked_up: 0, expired: 0 };
      }
      eventSummary[eventName][listing.status]++;
    });

    Object.entries(eventSummary).forEach(([eventName, counts]) => {
      console.log(`  ${eventName}:`);
      console.log(`    Available: ${counts.available}`);
      console.log(`    Picked Up: ${counts.picked_up}`);
      console.log(`    Expired: ${counts.expired}`);
    });

    console.log("\n🎉 Food listings seeded successfully!");
    console.log(
      "💡 Now you can view the analytics page to see charts and data!"
    );
  } catch (error) {
    console.error("❌ Error seeding food listings:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the seeding
seedFoodListings();
