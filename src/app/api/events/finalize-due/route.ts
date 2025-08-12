import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { eventId, force } = await request.json();

    if (eventId) {
      // Finalize specific event
      return await finalizeSpecificEvent(eventId, force);
    } else {
      // Finalize all due events
      return await finalizeAllDueEvents();
    }
  } catch (error) {
    console.error("Error in event finalization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Finalize a specific event
async function finalizeSpecificEvent(eventId: string, force: boolean = false) {
  try {
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event should be finalized
    if (!force && event.status === "completed") {
      return NextResponse.json({
        message: "Event already completed",
        eventId,
        status: "already_completed",
      });
    }

    // Check if event is due for finalization (past end time + buffer)
    const now = new Date();
    const eventEnd = new Date(`${event.date}T${event.end_time}`);
    const bufferHours = 2; // 2 hour buffer after event ends
    const finalizationTime = new Date(
      eventEnd.getTime() + bufferHours * 60 * 60 * 1000
    );

    if (!force && now < finalizationTime) {
      return NextResponse.json({
        message: "Event not yet due for finalization",
        eventId,
        status: "not_due",
        finalizationTime: finalizationTime.toISOString(),
        currentTime: now.toISOString(),
      });
    }

    // Get all food listings for this event
    const { data: listings, error: listingsError } = await supabase
      .from("food_listings")
      .select("*")
      .eq("event_id", eventId);

    if (listingsError) {
      console.error("Error fetching listings:", listingsError);
      return NextResponse.json(
        { error: "Failed to fetch event listings" },
        { status: 500 }
      );
    }

    // Expire unclaimed listings
    const { error: expireError } = await supabase
      .from("food_listings")
      .update({ status: "expired" })
      .eq("event_id", eventId)
      .eq("status", "available");

    if (expireError) {
      console.error("Error expiring listings:", expireError);
      return NextResponse.json(
        { error: "Failed to expire unclaimed listings" },
        { status: 500 }
      );
    }

    // Mark event as completed
    const { error: updateError } = await supabase
      .from("events")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating event status:", updateError);
      return NextResponse.json(
        { error: "Failed to update event status" },
        { status: 500 }
      );
    }

    // Generate summary
    const availableListings =
      listings?.filter((l) => l.status === "available") || [];
    const pickedUpListings =
      listings?.filter((l) => l.status === "picked_up") || [];
    const expiredListings =
      listings?.filter((l) => l.status === "expired") || [];

    const summary = {
      eventId,
      eventName: event.name,
      totalListings: listings?.length || 0,
      available: availableListings.length,
      pickedUp: pickedUpListings.length,
      expired: expiredListings.length,
      newlyExpired: availableListings.length, // All available listings were just expired
      finalizationTime: new Date().toISOString(),
    };

    console.log(`Event ${event.name} finalized:`, summary);

    return NextResponse.json({
      message: "Event finalized successfully",
      eventId,
      status: "finalized",
      summary,
    });
  } catch (error) {
    console.error("Error finalizing specific event:", error);
    return NextResponse.json(
      { error: "Failed to finalize event" },
      { status: 500 }
    );
  }
}

// Finalize all events that are due
async function finalizeAllDueEvents() {
  try {
    const now = new Date();

    // Get all ongoing events that are past their end time + buffer
    const { data: dueEvents, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("status", "ongoing");

    if (eventsError) {
      console.error("Error fetching due events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch due events" },
        { status: 500 }
      );
    }

    if (!dueEvents || dueEvents.length === 0) {
      return NextResponse.json({
        message: "No events due for finalization",
        finalized: 0,
        status: "no_events_due",
      });
    }

    const results = [];
    let totalFinalized = 0;

    for (const event of dueEvents) {
      try {
        const eventEnd = new Date(`${event.date}T${event.end_time}`);
        const bufferHours = 2; // 2 hour buffer
        const finalizationTime = new Date(
          eventEnd.getTime() + bufferHours * 60 * 60 * 1000
        );

        if (now >= finalizationTime) {
          const result = await finalizeSpecificEvent(event.id, true);
          if (result.status === 200) {
            totalFinalized++;
            results.push({
              eventId: event.id,
              eventName: event.name,
              status: "finalized",
            });
          }
        }
      } catch (error) {
        console.error(`Error finalizing event ${event.id}:`, error);
        results.push({
          eventId: event.id,
          eventName: event.name,
          status: "failed",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: "Bulk finalization completed",
      totalEvents: dueEvents.length,
      finalized: totalFinalized,
      results,
      status: "completed",
    });
  } catch (error) {
    console.error("Error in bulk finalization:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk finalization" },
      { status: 500 }
    );
  }
}

// GET endpoint to check finalization status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (eventId) {
      // Check specific event finalization status
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, name, date, end_time, status")
        .eq("id", eventId)
        .single();

      if (eventError || !event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const now = new Date();
      const eventEnd = new Date(`${event.date}T${event.end_time}`);
      const bufferHours = 2;
      const finalizationTime = new Date(
        eventEnd.getTime() + bufferHours * 60 * 60 * 1000
      );

      return NextResponse.json({
        eventId,
        eventName: event.name,
        currentStatus: event.status,
        endTime: event.end_time,
        finalizationTime: finalizationTime.toISOString(),
        isDue: now >= finalizationTime,
        canFinalize: event.status === "ongoing" && now >= finalizationTime,
      });
    } else {
      // Get summary of all events that need finalization
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, name, date, end_time, status")
        .eq("status", "ongoing")
        .order("date", { ascending: false });

      if (eventsError) {
        return NextResponse.json(
          { error: "Failed to fetch events" },
          { status: 500 }
        );
      }

      const now = new Date();
      const dueEvents =
        events?.filter((event) => {
          const eventEnd = new Date(`${event.date}T${event.end_time}`);
          const finalizationTime = new Date(
            eventEnd.getTime() + 2 * 60 * 60 * 1000
          );
          return now >= finalizationTime;
        }) || [];

      return NextResponse.json({
        totalOngoing: events?.length || 0,
        dueForFinalization: dueEvents.length,
        dueEvents: dueEvents.map((event) => ({
          id: event.id,
          name: event.name,
          date: event.date,
          endTime: event.end_time,
        })),
      });
    }
  } catch (error) {
    console.error("Error checking finalization status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
