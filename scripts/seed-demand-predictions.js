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

async function seedDemandPredictions() {
  try {
    console.log("🚀 Starting demand predictions seeding...");

    // First, check if the demand_predictions table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("demand_predictions")
      .select("id")
      .limit(1);

    if (tableCheckError && tableCheckError.code === "42P01") {
      console.log(
        "⚠️  demand_predictions table does not exist. Please run the SQL script first:"
      );
      console.log("   docs/sql/create-demand-predictions-table.sql");
      return;
    }

    // Check what columns exist in the events table
    console.log("🔍 Checking events table structure...");

    // Try to get events with a basic select first
    const { data: basicEvents, error: basicError } = await supabase
      .from("events")
      .select("id, name, date, status")
      .eq("status", "upcoming")
      .limit(1);

    if (basicError) {
      console.error("❌ Error accessing events table:", basicError.message);
      return;
    }

    // Now try to get events with all the columns we need
    let eventsQuery = supabase.from("events").select("id, name, date, status");

    // Try to add optional columns if they exist
    try {
      const { data: testEvent, error: testError } = await supabase
        .from("events")
        .select("event_type, venue, expected_meals, expected_attendees")
        .limit(1);

      if (!testError && testEvent && testEvent.length > 0) {
        eventsQuery = supabase
          .from("events")
          .select(
            "id, name, date, status, event_type, venue, expected_meals, expected_attendees"
          );
        console.log("✅ Found extended event columns");
      } else {
        console.log(
          "⚠️  Some event columns are missing. Using basic columns only."
        );
      }
    } catch (error) {
      console.log(
        "⚠️  Some event columns are missing. Using basic columns only."
      );
    }

    const { data: events, error: eventsError } = await eventsQuery
      .eq("status", "upcoming")
      .limit(5);

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      console.log("⚠️  No upcoming events found. Please seed events first.");
      return;
    }

    console.log(`📅 Found ${events.length} upcoming events for predictions`);

    // Create sample predictions for each event
    const predictions = events.map((event) => {
      // Generate realistic prediction data based on available event characteristics
      const baseSurplus = 15; // Default 15kg base surplus

      // Adjust based on event type if available
      let typeMultiplier = 1.0;
      if (event.event_type === "corporate") typeMultiplier = 0.8;
      if (event.event_type === "social") typeMultiplier = 1.2;
      if (event.event_type === "educational") typeMultiplier = 1.0;

      // Adjust based on attendance if available
      let attendanceMultiplier = 1.0;
      if (event.expected_attendees > 200) attendanceMultiplier = 1.1;
      if (event.expected_attendees < 50) attendanceMultiplier = 0.9;

      const predictedSurplus =
        baseSurplus * typeMultiplier * attendanceMultiplier;

      // Generate confidence based on data quality
      const confidence = 0.6 + Math.random() * 0.3; // 60-90% confidence

      // Determine risk level
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
        recommendations: generateRecommendations(event, riskLevel),
        risk_level: riskLevel,
        last_updated: new Date().toISOString(),
      };
    });

    console.log(`🧠 Generated ${predictions.length} AI predictions...`);

    // Insert predictions
    const { data: insertedPredictions, error: insertError } = await supabase
      .from("demand_predictions")
      .insert(predictions)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert predictions: ${insertError.message}`);
    }

    console.log(
      `✅ Successfully inserted ${insertedPredictions.length} demand predictions!`
    );

    // Show summary
    console.log("\n📊 Demand Predictions Summary:");
    console.log("==============================");

    insertedPredictions.forEach((prediction, index) => {
      const event = events.find((e) => e.id === prediction.event_id);
      console.log(`\n🎯 ${event?.name || "Unknown Event"}`);
      console.log(`   📅 Date: ${event?.date || "Unknown"}`);
      console.log(
        `   📊 Predicted Surplus: ${prediction.predicted_surplus.totalKg}kg`
      );
      console.log(
        `   🎯 Confidence: ${(
          prediction.predicted_surplus.confidence * 100
        ).toFixed(0)}%`
      );
      console.log(`   ⚠️  Risk Level: ${prediction.risk_level.toUpperCase()}`);
      console.log(
        `   💡 Recommendations: ${prediction.recommendations.length} AI insights`
      );
    });

    console.log("\n🎉 Demand predictions seeded successfully!");
    console.log(
      "💡 Now you can test the AI demand prediction feature in the analytics dashboard!"
    );
  } catch (error) {
    console.error("❌ Error seeding demand predictions:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

function generateRecommendations(event, riskLevel) {
  const baseRecommendations = [
    "Monitor attendance patterns closely",
    "Implement flexible portion control",
    "Prepare backup distribution channels",
    "Communicate with attendees about food preferences",
  ];

  const riskSpecificRecommendations = {
    low: [
      "Maintain current portion planning",
      "Continue monitoring for any changes",
      "Consider reducing buffer quantities",
    ],
    medium: [
      "Increase monitoring frequency",
      "Prepare contingency plans",
      "Optimize portion sizes based on RSVPs",
    ],
    high: [
      "Implement strict portion control",
      "Set up multiple distribution points",
      "Consider reducing initial food preparation",
      "Establish rapid response team for surplus management",
    ],
  };

  const eventTypeRecommendations = {
    corporate: [
      "Use RSVP data for precise planning",
      "Consider dietary restriction surveys",
      "Implement professional catering standards",
    ],
    social: [
      "Plan for variable attendance",
      "Prepare diverse food options",
      "Consider buffet-style service",
    ],
    educational: [
      "Coordinate with student organizations",
      "Plan for academic calendar variations",
      "Consider meal plan integration",
    ],
  };

  const recommendations = [
    ...baseRecommendations,
    ...riskSpecificRecommendations[riskLevel],
    ...(eventTypeRecommendations[event.event_type] || []),
  ];

  // Return unique recommendations, limited to 6
  return [...new Set(recommendations)].slice(0, 6);
}

// Run the seeding
if (require.main === module) {
  seedDemandPredictions()
    .then(() => {
      console.log("\n✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDemandPredictions };
