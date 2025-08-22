import { NextRequest, NextResponse } from "next/server";
import { notifyUsersWithinRadiusForEvent, notifyUsersWithinRadiusForFoodListing } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, listingId, radiusKm = 5 } = body;

    if (eventId && listingId) {
      // Event-based notification (existing functionality)
      await notifyUsersWithinRadiusForEvent(eventId, listingId, radiusKm);
      return NextResponse.json({ success: true, message: "Event notifications sent" });
    } else if (listingId) {
      // Food listing notification (new functionality)
      await notifyUsersWithinRadiusForFoodListing(listingId, radiusKm);
      return NextResponse.json({ success: true, message: "Food listing notifications sent" });
    } else {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}

// GET endpoint to check notification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId parameter" },
        { status: 400 }
      );
    }

    // Get event notification settings
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("auto_notify_ngos, notify_radius_km, trusted_ngo_ids")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get NGO count for this event
    const { count: ngoCount, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "NGO")
      .eq("verified", true);

    if (countError) {
      console.error("Error counting NGOs:", countError);
    }

    return NextResponse.json({
      eventId,
      notificationSettings: {
        autoNotify: event.auto_notify_ngos,
        radiusKm: event.notify_radius_km,
        trustedNgos: event.trusted_ngo_ids?.length || 0,
      },
      availableNgos: ngoCount || 0,
      status: "ready",
    });
  } catch (error) {
    console.error("Error checking notification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
