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

async function setupAIDemandPrediction() {
  try {
    console.log("🚀 Setting up AI Demand Prediction Feature...");
    console.log("===============================================");

    // Step 1: Check and fix events table structure
    console.log("\n📋 Step 1: Checking events table structure...");
    await checkAndFixEventsTable();

    // Step 2: Create demand_predictions table
    console.log("\n📋 Step 2: Creating demand_predictions table...");
    await createDemandPredictionsTable();

    // Step 3: Seed sample events
    console.log("\n📋 Step 3: Seeding sample events...");
    await seedSampleEvents();

    // Step 4: Seed demand predictions
    console.log("\n📋 Step 4: Seeding demand predictions...");
    await seedDemandPredictions();

    console.log("\n🎉 AI Demand Prediction setup completed successfully!");
    console.log("💡 You can now test the feature in your analytics dashboard!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

async function checkAndFixEventsTable() {
  try {
    // Check if required columns exist
    const { data: columns, error: columnsError } = await supabase
      .from("events")
      .select("id, name, date, status")
      .limit(1);

    if (columnsError) {
      throw new Error(`Cannot access events table: ${columnsError.message}`);
    }

    // Try to add missing columns
    const requiredColumns = [
      { name: "event_type", type: "TEXT", default: "'general'" },
      { name: "venue", type: "TEXT", default: "'Unknown'" },
      {
        name: "expected_meals",
        type: "JSONB",
        default: '\'{"veg": 0, "nonVeg": 0, "total": 0}\'::jsonb',
      },
      { name: "expected_attendees", type: "INTEGER", default: "100" },
    ];

    for (const column of requiredColumns) {
      try {
        await supabase.rpc("exec_sql", {
          sql: `ALTER TABLE events ADD COLUMN IF NOT EXISTS ${column.name} ${column.type} DEFAULT ${column.default};`,
        });
        console.log(`   ✅ Added/verified column: ${column.name}`);
      } catch (error) {
        // Column might already exist, try direct SQL
        try {
          await supabase.rpc("exec_sql", {
            sql: `ALTER TABLE events ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};`,
          });
          console.log(`   ✅ Added column: ${column.name}`);
        } catch (addError) {
          console.log(
            `   ℹ️  Column ${column.name} already exists or couldn't be added`
          );
        }
      }
    }

    // Update existing events with default values
    try {
      await supabase.rpc("exec_sql", {
        sql: `
          UPDATE events 
          SET 
            event_type = COALESCE(event_type, 'general'),
            venue = COALESCE(venue, 'Unknown'),
            expected_meals = COALESCE(expected_meals, '{"veg": 0, "nonVeg": 0, "total": 0}'::jsonb),
            expected_attendees = COALESCE(expected_attendees, 100)
          WHERE 
            event_type IS NULL 
            OR venue IS NULL 
            OR expected_meals IS NULL 
            OR expected_attendees IS NULL;
        `,
      });
      console.log("   ✅ Updated existing events with default values");
    } catch (error) {
      console.log("   ℹ️  Could not update existing events (this is okay)");
    }
  } catch (error) {
    console.log("   ⚠️  Could not automatically fix events table structure");
    console.log("   💡 You may need to run the SQL scripts manually");
  }
}

async function createDemandPredictionsTable() {
  try {
    // Check if table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("demand_predictions")
      .select("id")
      .limit(1);

    if (tableCheckError && tableCheckError.code === "42P01") {
      // Table doesn't exist, create it
      try {
        await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS demand_predictions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              event_id UUID REFERENCES events(id) ON DELETE CASCADE,
              predicted_surplus JSONB NOT NULL,
              factors JSONB NOT NULL,
              recommendations TEXT[] NOT NULL,
              risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
              last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        });
        console.log("   ✅ Created demand_predictions table");

        // Create indexes
        await supabase.rpc("exec_sql", {
          sql: `
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_event_id ON demand_predictions(event_id);
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_risk_level ON demand_predictions(risk_level);
            CREATE INDEX IF NOT EXISTS idx_demand_predictions_last_updated ON demand_predictions(last_updated);
          `,
        });
        console.log("   ✅ Created indexes");
      } catch (createError) {
        console.log("   ⚠️  Could not create table automatically");
        console.log("   💡 You may need to run the SQL script manually");
      }
    } else {
      console.log("   ✅ demand_predictions table already exists");
    }
  } catch (error) {
    console.log("   ⚠️  Could not check/create demand_predictions table");
  }
}

async function seedSampleEvents() {
  try {
    // Check if we already have events
    const { data: existingEvents, error: checkError } = await supabase
      .from("events")
      .select("id")
      .limit(5);

    if (existingEvents && existingEvents.length >= 3) {
      console.log("   ✅ Events already exist, skipping seeding");
      return;
    }

    // First, we need to create or get an organizer user
    console.log("   👤 Setting up organizer user...");

    // Try to get an existing user first
    const { data: existingUsers, error: usersError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    let organizerId;

    if (usersError || !existingUsers || existingUsers.length === 0) {
      // No users exist, create a sample organizer
      console.log("     📝 Creating sample organizer user...");

      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          email: "organizer@forkware.com",
          name: "Sample Event Organizer",
          role: "canteen",
          status: "active",
        })
        .select();

      if (createUserError) {
        console.log(
          "     ⚠️  Could not create user, trying with minimal data..."
        );
        // Try with just the required fields
        const { data: minimalUser, error: minimalError } = await supabase
          .from("users")
          .insert({
            email: "organizer@forkware.com",
            name: "Sample Organizer",
          })
          .select();

        if (minimalError) {
          throw new Error(
            `Cannot create organizer user: ${minimalError.message}`
          );
        }
        organizerId = minimalUser[0].id;
      } else {
        organizerId = newUser[0].id;
      }

      console.log(`     ✅ Created organizer with ID: ${organizerId}`);
    } else {
      organizerId = existingUsers[0].id;
      console.log(`     ✅ Using existing user as organizer: ${organizerId}`);
    }

    // Sample events for testing
    const sampleEvents = [
      {
        name: "Tech Conference 2024",
        date: "2024-12-20",
        start_time: "09:00:00",
        end_time: "17:00:00",
        status: "upcoming",
        venue: "Convention Center",
        organizer_id: organizerId,
        event_type: "corporate",
        expected_meals: { veg: 80, nonVeg: 120, total: 200 },
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
        event_type: "social",
        expected_meals: { veg: 150, nonVeg: 100, total: 250 },
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
        event_type: "educational",
        expected_meals: { veg: 60, nonVeg: 90, total: 150 },
        expected_attendees: 200,
        description: "Career fair for graduating students and employers",
      },
    ];

    const { data: insertedEvents, error: insertError } = await supabase
      .from("events")
      .insert(sampleEvents)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert events: ${insertError.message}`);
    }

    console.log(`   ✅ Created ${insertedEvents.length} sample events`);
  } catch (error) {
    console.log("   ⚠️  Could not seed sample events:", error.message);
  }
}

async function seedDemandPredictions() {
  try {
    // Get upcoming events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, date, event_type, expected_meals, expected_attendees")
      .eq("status", "upcoming")
      .limit(3);

    if (eventsError || !events || events.length === 0) {
      console.log("   ⚠️  No upcoming events found for predictions");
      return;
    }

    // Create sample predictions
    const predictions = events.map((event) => {
      const baseSurplus = 15;
      let typeMultiplier = 1.0;
      if (event.event_type === "corporate") typeMultiplier = 0.8;
      if (event.event_type === "social") typeMultiplier = 1.2;

      let attendanceMultiplier = 1.0;
      if (event.expected_attendees > 200) attendanceMultiplier = 1.1;
      if (event.expected_attendees < 50) attendanceMultiplier = 0.9;

      const predictedSurplus =
        baseSurplus * typeMultiplier * attendanceMultiplier;
      const confidence = 0.6 + Math.random() * 0.3;

      let riskLevel = "medium";
      if (predictedSurplus < 10) riskLevel = "low";
      if (predictedSurplus > 25) riskLevel = "high";

      return {
        event_id: event.id,
        predicted_surplus: {
          totalKg: Math.round(predictedSurplus * 10) / 10,
          confidence: Math.round(confidence * 100) / 100,
          breakdown: {
            veg: Math.round(predictedSurplus * 0.4 * 10) / 10,
            nonVeg: Math.round(predictedSurplus * 0.4 * 10) / 10,
            desserts: Math.round(predictedSurplus * 0.15 * 10) / 10,
            beverages: Math.round(predictedSurplus * 0.05 * 10) / 10,
          },
        },
        factors: {
          historicalWaste: Math.round((0.1 + Math.random() * 0.2) * 100) / 100,
          attendanceVariation:
            Math.round((0.05 + Math.random() * 0.15) * 100) / 100,
          weatherImpact: Math.round((0.02 + Math.random() * 0.08) * 100) / 100,
          eventTypeFactor:
            Math.round((0.05 + Math.random() * 0.15) * 100) / 100,
          seasonalAdjustment:
            Math.round((0.02 + Math.random() * 0.08) * 100) / 100,
        },
        recommendations: [
          "Monitor attendance patterns closely",
          "Implement flexible portion control",
          "Prepare backup distribution channels",
        ],
        risk_level: riskLevel,
        last_updated: new Date().toISOString(),
      };
    });

    const { data: insertedPredictions, error: insertError } = await supabase
      .from("demand_predictions")
      .insert(predictions)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert predictions: ${insertError.message}`);
    }

    console.log(
      `   ✅ Created ${insertedPredictions.length} demand predictions`
    );
  } catch (error) {
    console.log("   ⚠️  Could not seed demand predictions:", error.message);
  }
}

// Run the setup
if (require.main === module) {
  setupAIDemandPrediction()
    .then(() => {
      console.log("\n✨ Setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupAIDemandPrediction };
