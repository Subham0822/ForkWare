// Seed fresh food listings with expiry dates after August 23rd, 2024
// This script adds new food items to the database

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
    'Please run with: $env:NEXT_PUBLIC_SUPABASE_URL="YOUR_URL"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY"; node scripts/seed-fresh-food.js'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedFreshFood() {
  try {
    console.log("🌱 Starting to seed fresh food listings...");

    // Sample fresh food listings with expiry dates after August 23rd, 2024
    const freshFoodListings = [
      {
        food_name: "Fresh Vegetable Curry",
        quantity: "25 plates",
        description: "Fresh aromatic vegetable curry with spices",
        pickup_location: "Main Canteen",
        expiry_date: "2025-08-25T18:00:00.000Z", // August 25th, 6 PM
        status: "available",
        food_type: "veg",
        allergens: ["onions"],
        temperature: "Hot",
        preparation_method: "Fresh cooked with spices",
        safety_rating: 5,
        storage_conditions: "Keep warm, covered",
        user_id: null, // Will be set to system user
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Chicken Biryani",
        quantity: "30 plates",
        description: "Layered rice with spiced chicken and aromatic spices",
        pickup_location: "Staff Canteen",
        expiry_date: "2025-08-26T20:00:00.000Z", // August 26th, 8 PM
        status: "available",
        food_type: "non_veg",
        allergens: ["nuts", "dairy"],
        temperature: "Hot",
        preparation_method: "Layered rice with spiced chicken",
        safety_rating: 5,
        storage_conditions: "Keep warm, covered",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Fresh Fruit Salad",
        quantity: "40 portions",
        description: "Mixed seasonal fruits with honey dressing",
        pickup_location: "Health Center",
        expiry_date: "2025-08-27T12:00:00.000Z", // August 27th, 12 PM
        status: "available",
        food_type: "veg",
        allergens: [],
        temperature: "Cold",
        preparation_method: "Fresh cut mixed fruits",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Whole Grain Bread",
        quantity: "50 loaves",
        description: "Fresh baked whole grain bread with seeds",
        pickup_location: "Bakery Corner",
        expiry_date: "2025-08-28T16:00:00.000Z", // August 28th, 4 PM
        status: "available",
        food_type: "veg",
        allergens: ["gluten", "wheat"],
        temperature: "Room temperature",
        preparation_method: "Fresh baked whole grain",
        safety_rating: 5,
        storage_conditions: "Room temperature, sealed",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Mixed Vegetable Soup",
        quantity: "35 bowls",
        description: "Hearty vegetable soup with fresh herbs",
        pickup_location: "Main Canteen",
        expiry_date: "2025-08-29T19:00:00.000Z", // August 29th, 7 PM
        status: "available",
        food_type: "veg",
        allergens: ["celery"],
        temperature: "Hot",
        preparation_method: "Fresh vegetable broth",
        safety_rating: 4,
        storage_conditions: "Keep warm",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Grilled Fish",
        quantity: "20 plates",
        description: "Fresh grilled fish with herbs and lemon",
        pickup_location: "Seafood Corner",
        expiry_date: "2025-08-30T21:00:00.000Z", // August 30th, 9 PM
        status: "available",
        food_type: "non_veg",
        allergens: ["fish"],
        temperature: "Hot",
        preparation_method: "Fresh grilled with herbs",
        safety_rating: 5,
        storage_conditions: "Keep warm, covered",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Pasta with Tomato Sauce",
        quantity: "45 plates",
        description: "Al dente pasta with rich tomato sauce",
        pickup_location: "Italian Corner",
        expiry_date: "2025-08-31T18:00:00.000Z", // August 31st, 6 PM
        status: "available",
        food_type: "veg",
        allergens: ["gluten"],
        temperature: "Hot",
        preparation_method: "Fresh cooked pasta with sauce",
        safety_rating: 4,
        storage_conditions: "Keep warm",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Fresh Yogurt",
        quantity: "60 cups",
        description: "Creamy natural yogurt with live cultures",
        pickup_location: "Dairy Section",
        expiry_date: "2025-09-01T14:00:00.000Z", // September 1st, 2 PM
        status: "available",
        food_type: "veg",
        allergens: ["dairy"],
        temperature: "Cold",
        preparation_method: "Fresh cultured yogurt",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Mixed Nuts",
        quantity: "25 packets",
        description: "Premium mixed nuts with dried fruits",
        pickup_location: "Snack Corner",
        expiry_date: "2025-09-02T16:00:00.000Z", // September 2nd, 4 PM
        status: "available",
        food_type: "veg",
        allergens: ["nuts", "peanuts"],
        temperature: "Room temperature",
        preparation_method: "Premium mixed nuts",
        safety_rating: 5,
        storage_conditions: "Room temperature, sealed",
        user_id: null,
        created_at: new Date().toISOString(),
      },
      {
        food_name: "Green Salad",
        quantity: "30 bowls",
        description: "Fresh mixed greens with vinaigrette",
        pickup_location: "Salad Bar",
        expiry_date: "2025-09-03T13:00:00.000Z", // September 3rd, 1 PM
        status: "available",
        food_type: "veg",
        allergens: [],
        temperature: "Cold",
        preparation_method: "Fresh mixed greens",
        safety_rating: 5,
        storage_conditions: "Refrigerated",
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ];

    console.log(
      `🍽️  Adding ${freshFoodListings.length} fresh food listings...`
    );

    // Insert food listings
    const { data: insertedListings, error: insertError } = await supabase
      .from("food_listings")
      .insert(freshFoodListings)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert food listings: ${insertError.message}`);
    }

    console.log(
      `✅ Successfully added ${insertedListings.length} fresh food listings!`
    );

    // Show summary
    console.log("\n📊 Fresh Food Listings Summary:");
    console.log("All items have expiry dates after August 23rd, 2025:");

    insertedListings.forEach((listing) => {
      const expiryDate = new Date(listing.expiry_date);
      const formattedDate = expiryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log(`  • ${listing.food_name} - Expires: ${formattedDate}`);
      console.log(
        `    Location: ${listing.pickup_location} | Quantity: ${listing.quantity}`
      );
      console.log(
        `    Safety Rating: ${listing.safety_rating}/5 | Temperature: ${listing.temperature}`
      );
      if (listing.allergens && listing.allergens.length > 0) {
        console.log(`    Allergens: ${listing.allergens.join(", ")}`);
      }
      console.log("");
    });

    console.log("🎉 Fresh food listings seeded successfully!");
    console.log(
      "💡 Now volunteers can see these items and use the pickup form!"
    );
  } catch (error) {
    console.error("❌ Error seeding fresh food listings:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the seeding
seedFreshFood();
