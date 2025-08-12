import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { eventId, listingId, listingDetails } = await request.json();

    if (!eventId || !listingId) {
      return NextResponse.json(
        { error: "Missing eventId or listingId" },
        { status: 400 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get NGOs to notify based on event settings
    const { data: ngos, error: ngoError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("role", "NGO")
      .eq("verified", true);

    if (ngoError) {
      console.error("Error fetching NGOs:", ngoError);
      return NextResponse.json(
        { error: "Failed to fetch NGOs" },
        { status: 500 }
      );
    }

    if (!ngos || ngos.length === 0) {
      return NextResponse.json(
        { message: "No NGOs to notify", notified: 0 },
        { status: 200 }
      );
    }

    // Filter NGOs by distance if event has location settings
    let filteredNgos = ngos;
    if (event.venue_lat && event.venue_lng && event.notify_radius_km) {
      // For now, include all NGOs since we don't have NGO location data
      // TODO: Implement distance-based filtering when NGO profiles have coordinates
      filteredNgos = ngos;
    }

    // Filter by trusted NGOs if specified
    if (event.trusted_ngo_ids && event.trusted_ngo_ids.length > 0) {
      filteredNgos = filteredNgos.filter((ngo) =>
        event.trusted_ngo_ids!.includes(ngo.id)
      );
    }

    // Send notifications (placeholder for now - would integrate with email/push service)
    const notificationPromises = filteredNgos.map(async (ngo) => {
      try {
        // TODO: Replace with actual notification service
        // For now, just log the notification
        console.log(
          `Notifying NGO ${ngo.name} (${ngo.email}) about surplus listing ${listingId}`
        );

        // You would integrate with:
        // - Email service (SendGrid, AWS SES)
        // - Push notifications (Firebase, OneSignal)
        // - SMS service (Twilio)

        return { ngoId: ngo.id, status: "notified" };
      } catch (error) {
        console.error(`Failed to notify NGO ${ngo.id}:`, error);
        return { ngoId: ngo.id, status: "failed", error: error.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Log notification results
    console.log(
      `NGO notifications sent: ${successful} successful, ${failed} failed`
    );

    return NextResponse.json({
      message: "Notifications sent",
      eventId,
      listingId,
      totalNgos: ngos.length,
      notified: successful,
      failed,
      details: {
        eventName: event.name,
        venue: event.venue,
        foodName: listingDetails?.food_name || "Surplus food",
        quantity: listingDetails?.quantity || "Unknown quantity",
        expiry: listingDetails?.expiry_date || "Unknown expiry",
      },
    });
  } catch (error) {
    console.error("Error in NGO notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
