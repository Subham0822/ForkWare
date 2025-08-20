import { NextRequest, NextResponse } from "next/server";
import {
  predictDemand,
  getDemandPredictions,
  updateDemandPrediction,
} from "@/lib/demand-prediction";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, action } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    let result;

    if (action === "update") {
      // Update existing prediction
      result = await updateDemandPrediction(eventId);
    } else {
      // Get event data using Supabase client
      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError || !events) {
        console.error("Event fetch error:", eventError);
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const eventData = events;

      // Create prediction input
      const predictionInput = {
        eventId: eventData.id,
        eventName: eventData.name,
        eventDate: eventData.date,
        expectedMeals: eventData.expected_meals || {
          veg: 0,
          nonVeg: 0,
          total: 0,
        },
        expectedAttendance: eventData.expected_attendees || 100,
        eventType: eventData.event_type || "general",
        venue: eventData.venue || "Unknown",
      };

      console.log("Generating prediction for:", predictionInput);
      result = await predictDemand(predictionInput);
    }

    if (!result) {
      console.error("No prediction result generated");
      return NextResponse.json(
        { error: "Failed to generate prediction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction: result,
    });
  } catch (error) {
    console.error("Error in demand prediction API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const predictions = await getDemandPredictions();

    return NextResponse.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error("Error fetching demand predictions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
