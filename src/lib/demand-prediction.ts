import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createClient(url, serviceKey);
  }
  return supabase;
}

export interface DemandPrediction {
  eventId: string;
  eventName: string;
  eventDate: string;
  predictedSurplus: {
    totalKg: number;
    confidence: number;
    breakdown: {
      veg: number;
      nonVeg: number;
      desserts: number;
      beverages: number;
    };
  };
  factors: {
    historicalWaste: number;
    attendanceVariation: number;
    weatherImpact: number;
    eventTypeFactor: number;
    seasonalAdjustment: number;
  };
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  lastUpdated: string;
}

export interface HistoricalData {
  eventId: string;
  eventName: string;
  eventDate: string;
  expectedMeals: {
    veg: number;
    nonVeg: number;
    total: number;
  };
  actualMealsServed: number;
  surplusGenerated: number;
  attendance: number;
  expectedAttendance: number;
  weather: string;
  eventType: string;
  season: string;
}

export interface PredictionInput {
  eventId: string;
  eventName: string;
  eventDate: string;
  expectedMeals: {
    veg: number;
    nonVeg: number;
    total: number;
  };
  expectedAttendance: number;
  eventType: string;
  venue: string;
  historicalData?: HistoricalData[];
}

export async function predictDemand(
  input: PredictionInput
): Promise<DemandPrediction> {
  try {
    // Get historical data for similar events
    const historicalData = await getHistoricalEventData(
      input.eventType,
      input.venue
    );

    // Prepare data for AI analysis
    const analysisData = {
      currentEvent: input,
      historicalPatterns: historicalData,
      marketTrends: await getMarketTrends(),
      seasonalFactors: getSeasonalFactors(input.eventDate),
    };

    const prompt = `
    You are an AI expert in food demand prediction and waste reduction. Analyze the following data to predict surplus food generation for an upcoming event.

    CURRENT EVENT:
    - Name: ${input.eventName}
    - Date: ${input.eventDate}
    - Expected Meals: ${JSON.stringify(input.expectedMeals)}
    - Expected Attendance: ${input.expectedAttendance}
    - Event Type: ${input.eventType}
    - Venue: ${input.venue}

    HISTORICAL PATTERNS (${historicalData.length} similar events):
    ${historicalData
      .map(
        (h) => `
    - ${h.eventName} (${h.eventDate}): Expected ${h.expectedMeals.total} meals, Actual ${h.actualMealsServed}, Surplus ${h.surplusGenerated}kg, Attendance ${h.attendance}/${h.expectedAttendance}
    `
      )
      .join("")}

    MARKET TRENDS: ${JSON.stringify(analysisData.marketTrends)}
    SEASONAL FACTORS: ${JSON.stringify(analysisData.seasonalFactors)}

    TASK: Predict surplus food generation and provide actionable insights.

    RESPONSE FORMAT (return ONLY valid JSON):
    {
      "predictedSurplus": {
        "totalKg": X.X,
        "confidence": X.X,
        "breakdown": {
          "veg": X.X,
          "nonVeg": X.X,
          "desserts": X.X,
          "beverages": X.X
        }
      },
      "factors": {
        "historicalWaste": X.X,
        "attendanceVariation": X.X,
        "weatherImpact": X.X,
        "eventTypeFactor": X.X,
        "seasonalAdjustment": X.X
      },
      "recommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
      ],
      "riskLevel": "low|medium|high"
    }

    ANALYSIS GUIDELINES:
    - Use historical patterns to identify waste trends
    - Consider seasonal variations (holidays, weather, etc.)
    - Factor in event type characteristics (corporate vs. social vs. educational)
    - Account for attendance prediction accuracy
    - Provide realistic surplus estimates in kilograms
    - Confidence should be 0.0-1.0 based on data quality
    - Risk level: low (<10% surplus), medium (10-25%), high (>25%)

    IMPORTANT: Return ONLY the JSON, no additional text.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1500,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse Gemini response");
    }

    const predictionData = JSON.parse(jsonMatch[0]);

    // Validate and create prediction object
    const prediction: DemandPrediction = {
      eventId: input.eventId,
      eventName: input.eventName,
      eventDate: input.eventDate,
      predictedSurplus: {
        totalKg: predictionData.predictedSurplus?.totalKg || 0,
        confidence: Math.min(
          Math.max(predictionData.predictedSurplus?.confidence || 0.5, 0),
          1
        ),
        breakdown: {
          veg: predictionData.predictedSurplus?.breakdown?.veg || 0,
          nonVeg: predictionData.predictedSurplus?.breakdown?.nonVeg || 0,
          desserts: predictionData.predictedSurplus?.breakdown?.desserts || 0,
          beverages: predictionData.predictedSurplus?.breakdown?.beverages || 0,
        },
      },
      factors: {
        historicalWaste: predictionData.factors?.historicalWaste || 0,
        attendanceVariation: predictionData.factors?.attendanceVariation || 0,
        weatherImpact: predictionData.factors?.weatherImpact || 0,
        eventTypeFactor: predictionData.factors?.eventTypeFactor || 0,
        seasonalAdjustment: predictionData.factors?.seasonalAdjustment || 0,
      },
      recommendations: predictionData.recommendations || [
        "Monitor attendance closely",
        "Prepare flexible portioning",
      ],
      riskLevel: predictionData.riskLevel || "medium",
      lastUpdated: new Date().toISOString(),
    };

    // Store prediction in database for future reference
    await storePrediction(prediction);

    return prediction;
  } catch (error) {
    console.error("Error predicting demand:", error);

    // Fallback prediction based on simple heuristics
    return generateFallbackPrediction(input);
  }
}

async function getHistoricalEventData(
  eventType: string,
  venue: string
): Promise<HistoricalData[]> {
  try {
    // Get completed events with similar characteristics
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        expected_meals,
        expected_attendees,
        event_type,
        venue
      `
      )
      .eq("status", "completed")
      .eq("event_type", eventType)
      .order("date", { ascending: false })
      .limit(10);

    if (error || !events) return [];

    // Get food listing data for these events
    const historicalData: HistoricalData[] = [];

    for (const event of events) {
      const { data: listings } = await supabase
        .from("food_listings")
        .select("quantity, status, food_name")
        .eq("event_id", event.id);

      if (listings) {
        const actualMealsServed = listings.filter(
          (l) => l.status === "picked_up"
        ).length;
        const surplusGenerated = listings.filter(
          (l) => l.status === "expired"
        ).length;

        historicalData.push({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          expectedMeals: event.expected_meals || {
            veg: 0,
            nonVeg: 0,
            total: 0,
          },
          actualMealsServed,
          surplusGenerated: surplusGenerated * 0.5, // Estimate 0.5kg per expired item
          attendance: Math.round(
            (actualMealsServed / (event.expected_meals?.total || 1)) *
              (event.expected_attendees || 100)
          ),
          expectedAttendance: event.expected_attendees || 100,
          weather: "unknown", // Could be enhanced with weather API
          eventType: event.event_type || "unknown",
          season: getSeasonFromDate(event.date),
        });
      }
    }

    return historicalData;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
}

async function getMarketTrends() {
  // Mock market trends - in production, this could integrate with external APIs
  return {
    foodWasteAwareness: 0.85,
    sustainableEventTrend: 0.78,
    portionControlAdoption: 0.72,
    localFoodMovement: 0.68,
  };
}

function getSeasonalFactors(eventDate: string) {
  const date = new Date(eventDate);
  const month = date.getMonth();
  const day = date.getDate();

  // Holiday and seasonal adjustments
  const seasonalFactors = {
    holidayMultiplier: 1.0,
    weatherMultiplier: 1.0,
    seasonalDemand: 1.0,
  };

  // Holiday adjustments
  if (month === 11 && day >= 20) seasonalFactors.holidayMultiplier = 1.3; // Christmas
  if (month === 0 && day <= 7) seasonalFactors.holidayMultiplier = 1.2; // New Year
  if (month === 6 && day === 4) seasonalFactors.holidayMultiplier = 1.4; // Independence Day

  // Seasonal adjustments
  if (month >= 5 && month <= 8) seasonalFactors.seasonalDemand = 0.9; // Summer - lighter meals
  if (month >= 11 || month <= 2) seasonalFactors.seasonalDemand = 1.1; // Winter - heartier meals

  return seasonalFactors;
}

function getSeasonFromDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

async function storePrediction(prediction: DemandPrediction) {
  try {
    const server = getServerSupabase();
    const { error } = await server.from("demand_predictions").upsert({
      event_id: prediction.eventId,
      predicted_surplus: prediction.predictedSurplus,
      factors: prediction.factors,
      recommendations: prediction.recommendations,
      risk_level: prediction.riskLevel,
      last_updated: prediction.lastUpdated,
      created_at: prediction.lastUpdated, // Use lastUpdated as created_at for upsert
    });

    if (error) {
      console.warn("Failed to store prediction:", error);
      throw error; // Re-throw to handle in calling function
    }

    console.log(
      "✅ Prediction stored successfully for event:",
      prediction.eventId
    );
  } catch (error) {
    console.warn("Error storing prediction:", error);
    throw error; // Re-throw to handle in calling function
  }
}

export async function getDemandPredictions(): Promise<DemandPrediction[]> {
  try {
    const server = getServerSupabase();
    const { data, error } = await server
      .from("demand_predictions")
      .select(
        `
        *,
        events(
          id,
          name,
          date
        )
      `
      )
      .order("last_updated", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log("No demand predictions found in database");
      return [];
    }

    // Map database fields to DemandPrediction interface
    const predictions: DemandPrediction[] = data.map((dbPrediction: any) => ({
      eventId: dbPrediction.event_id,
      eventName: dbPrediction.events?.name || "Unknown Event",
      eventDate: dbPrediction.events?.date || "",
      predictedSurplus: dbPrediction.predicted_surplus,
      factors: dbPrediction.factors,
      recommendations: dbPrediction.recommendations,
      riskLevel: dbPrediction.risk_level,
      lastUpdated: dbPrediction.last_updated,
    }));

    console.log(
      `✅ Loaded ${predictions.length} demand predictions from database`
    );
    return predictions;
  } catch (error) {
    console.error("Error fetching demand predictions:", error);
    return [];
  }
}

export async function updateDemandPrediction(
  eventId: string
): Promise<DemandPrediction | null> {
  try {
    // Get event data
    const server = getServerSupabase();
    const { data: event, error: eventError } = await server
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) return null;

    // Create prediction input
    const input: PredictionInput = {
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      expectedMeals: event.expected_meals || { veg: 0, nonVeg: 0, total: 0 },
      expectedAttendance: event.expected_attendees || 100,
      eventType: event.event_type || "general",
      venue: event.venue,
    };

    // Generate new prediction
    return await predictDemand(input);
  } catch (error) {
    console.error("Error updating demand prediction:", error);
    return null;
  }
}
