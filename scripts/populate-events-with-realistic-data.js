const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateEventsWithRealisticData() {
  try {
    console.log("🚀 Populating events with realistic data...");
    console.log("===========================================");

    // Get all events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*");

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      console.log("ℹ️  No events found to populate");
      return;
    }

    console.log(`📊 Found ${events.length} events to populate`);

    // Step 1: Update events with realistic metadata
    console.log("\n1️⃣ Updating event metadata...");

    const eventUpdates = events.map((event) => {
      const eventType = event.event_type || "general";

      // Generate realistic data based on event type
      let realisticData = {};

      if (eventType === "corporate") {
        realisticData = {
          expected_attendees: Math.floor(Math.random() * 200) + 100, // 100-300
          expected_meals: {
            veg: Math.floor(Math.random() * 80) + 40, // 40-120
            non_veg: Math.floor(Math.random() * 120) + 60, // 60-180
            total: 0, // Will be calculated
          },
          description:
            event.description ||
            "Professional corporate event with networking opportunities and catering services",
        };
      } else if (eventType === "social") {
        realisticData = {
          expected_attendees: Math.floor(Math.random() * 300) + 200, // 200-500
          expected_meals: {
            veg: Math.floor(Math.random() * 150) + 100, // 100-250
            non_veg: Math.floor(Math.random() * 100) + 50, // 50-150
            total: 0, // Will be calculated
          },
          description:
            event.description ||
            "Community social gathering with food, entertainment, and family activities",
        };
      } else if (eventType === "educational") {
        realisticData = {
          expected_attendees: Math.floor(Math.random() * 150) + 80, // 80-230
          expected_meals: {
            veg: Math.floor(Math.random() * 60) + 30, // 30-90
            non_veg: Math.floor(Math.random() * 40) + 20, // 20-60
            total: 0, // Will be calculated
          },
          description:
            event.description ||
            "Educational workshop with learning materials, refreshments, and networking",
        };
      } else {
        realisticData = {
          expected_attendees: Math.floor(Math.random() * 150) + 100, // 100-250
          expected_meals: {
            veg: Math.floor(Math.random() * 75) + 50, // 50-125
            non_veg: Math.floor(Math.random() * 75) + 50, // 50-125
            total: 0, // Will be calculated
          },
          description:
            event.description ||
            "General event with food service, activities, and community engagement",
        };
      }

      // Calculate total meals
      realisticData.expected_meals.total =
        realisticData.expected_meals.veg + realisticData.expected_meals.non_veg;

      return {
        id: event.id,
        updates: realisticData,
      };
    });

    // Update events
    for (const update of eventUpdates) {
      const { error: updateError } = await supabase
        .from("events")
        .update(update.updates)
        .eq("id", update.id);

      if (updateError) {
        console.log(
          `⚠️  Failed to update event ${update.id}: ${updateError.message}`
        );
      } else {
        console.log(
          `✅ Updated event: ${update.updates.expected_attendees} attendees, ${update.updates.expected_meals.total} meals`
        );
      }
    }

    // Step 2: Create food listings for completed events
    console.log("\n2️⃣ Creating food listings for completed events...");

    const completedEvents = events.filter(
      (event) => event.status === "completed"
    );

    for (const event of completedEvents) {
      // Generate realistic food listings
      const foodItems = [
        {
          name: "Vegetarian Pasta",
          category: "Main Course",
          quantity: Math.floor(Math.random() * 50) + 30,
        },
        {
          name: "Chicken Curry",
          category: "Main Course",
          quantity: Math.floor(Math.random() * 40) + 25,
        },
        {
          name: "Fresh Salad",
          category: "Side Dish",
          quantity: Math.floor(Math.random() * 60) + 40,
        },
        {
          name: "Rice Pilaf",
          category: "Side Dish",
          quantity: Math.floor(Math.random() * 80) + 50,
        },
        {
          name: "Fruit Platter",
          category: "Dessert",
          quantity: Math.floor(Math.random() * 30) + 20,
        },
        {
          name: "Bread Rolls",
          category: "Bread",
          quantity: Math.floor(Math.random() * 100) + 60,
        },
        {
          name: "Water Bottles",
          category: "Beverage",
          quantity: Math.floor(Math.random() * 120) + 80,
        },
      ];

      const listings = foodItems.map((item) => ({
        event_id: event.id,
        food_name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: "pieces",
        expiry_date: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // Random expiry within 7 days
        status: Math.random() > 0.3 ? "picked_up" : "expired", // 70% picked up, 30% expired
        created_at: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // Random creation within last 30 days
      }));

      // Insert food listings
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

    // Step 3: Create some food listings for upcoming events (for demonstration)
    console.log("\n3️⃣ Creating sample food listings for upcoming events...");

    const upcomingEvents = events
      .filter((event) => event.status === "upcoming")
      .slice(0, 3); // Only first 3

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

    console.log("\n🎉 Events populated with realistic data successfully!");
    console.log("💡 Your analytics should now show meaningful numbers");
    console.log("🚀 Check the Analytics page to see the improvements!");
  } catch (error) {
    console.error("❌ Error populating events:", error.message);
  }
}

// Run the function
if (require.main === module) {
  populateEventsWithRealisticData()
    .then(() => {
      console.log("\n✨ Event population completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Event population failed:", error);
      process.exit(1);
    });
}

module.exports = { populateEventsWithRealisticData };
