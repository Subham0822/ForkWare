import { supabaseAdmin } from "./supabase-admin";
import { sendEmail } from "./email";

type MinimalEvent = {
  id: string;
  name: string;
  venue: string;
  venue_address?: string | null;
  date: string;
  latitude?: number | null;
  longitude?: number | null;
};

type MinimalListing = {
  id: string;
  expiry_date: string;
  pickup_location: string;
};

type NearbyProfile = {
  id: string;
  name: string | null;
  email: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
};

function formatExpiry(expiryIso: string): string {
  try {
    const d = new Date(expiryIso);
    if (Number.isNaN(d.getTime())) return expiryIso;
    return d.toLocaleString();
  } catch {
    return expiryIso;
  }
}

function buildEmailContent(
  recipientName: string | null,
  event: MinimalEvent,
  listing: MinimalListing
) {
  const name = recipientName || "there";
  const location = event.venue_address || event.venue || listing.pickup_location;
  const expiry = formatExpiry(listing.expiry_date);

  const subject = "Surplus Food Available Near You 🍴";
  const text = `Hi ${name},\n\nThere's surplus food available at ${location}. Please pick it up before ${expiry}.\n\n— ${event.name}`;
  const html = `
    <div>
      <p>Hi ${name},</p>
      <p>There's <strong>surplus food</strong> available at <strong>${location}</strong>.</p>
      <p>Please pick it up before <strong>${expiry}</strong>.</p>
      <p>— ${event.name}</p>
    </div>
  `;

  return { subject, text, html };
}

export async function notifyUsersWithinRadiusForEvent(
  eventId: string,
  listingId: string,
  radiusKm = 5
) {
  // Fetch event with coordinates
  const { data: event, error: eventError } = await supabaseAdmin
    .from("events")
    .select(
      "id, name, venue, venue_address, date, latitude, longitude"
    )
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    console.error("notify: failed to load event", eventError);
    return;
  }

  if (event.latitude == null || event.longitude == null) {
    console.warn("notify: event missing coordinates; skipping email notifications");
    return;
  }

  // Fetch listing (for expiry time and pickup location)
  const { data: listing, error: listingError } = await supabaseAdmin
    .from("food_listings")
    .select("id, expiry_date, pickup_location")
    .eq("id", listingId)
    .single();
  if (listingError || !listing) {
    console.error("notify: failed to load listing", listingError);
    return;
  }

  // Call RPC to fetch nearby profiles
  const { data: recipients, error: rpcError } = await supabaseAdmin.rpc(
    "profiles_within_radius",
    {
      center_lat: event.latitude,
      center_lon: event.longitude,
      radius_km: radiusKm,
    }
  );

  if (rpcError) {
    console.error("notify: RPC profiles_within_radius failed", rpcError);
    return;
  }

  if (!recipients || recipients.length === 0) {
    return;
  }

  const toSend: NearbyProfile[] = recipients as any;

  const sendOps = toSend.map((u) => {
    const { subject, text, html } = buildEmailContent(u.name, event as MinimalEvent, listing as MinimalListing);
    return sendEmail({ to: u.email, subject, text, html });
  });

  await Promise.allSettled(sendOps);
}

// New function to notify users within radius of a food listing
export async function notifyUsersWithinRadiusForFoodListing(
  listingId: string,
  radiusKm = 5
) {
  // Fetch listing with coordinates
  const { data: listing, error: listingError } = await supabaseAdmin
    .from("food_listings")
    .select("id, food_name, expiry_date, pickup_location, latitude, longitude, event_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    console.error("notify: failed to load listing", listingError);
    return;
  }

  if (listing.latitude == null || listing.longitude == null) {
    console.warn("notify: listing missing coordinates; skipping email notifications");
    return;
  }

  // Call RPC to fetch nearby profiles
  const { data: recipients, error: rpcError } = await supabaseAdmin.rpc(
    "profiles_within_radius",
    {
      center_lat: listing.latitude,
      center_lon: listing.longitude,
      radius_km: radiusKm,
    }
  );

  if (rpcError) {
    console.error("notify: RPC profiles_within_radius failed", rpcError);
    return;
  }

  if (!recipients || recipients.length === 0) {
    return;
  }

  const toSend: NearbyProfile[] = recipients as any;

  // Build email content for food listing
  const sendOps = toSend.map((u) => {
    const { subject, text, html } = buildFoodListingEmailContent(u.name, listing);
    return sendEmail({ to: u.email, subject, text, html });
  });

  await Promise.allSettled(sendOps);
}

// Helper function to build email content for food listings
function buildFoodListingEmailContent(
  recipientName: string | null,
  listing: any
) {
  const name = recipientName || "there";
  const location = listing.pickup_location || "the specified location";
  const expiry = formatExpiry(listing.expiry_date);

  const subject = "Surplus Food Available Near You 🍴";
  const text = `Hi ${name},\n\nThere's surplus food available at ${location}. Please pick it up before ${expiry}.\n\n— ${listing.food_name}`;
  const html = `
    <div>
      <p>Hi ${name},</p>
      <p>There's <strong>surplus food</strong> available at <strong>${location}</strong>.</p>
      <p>Please pick it up before <strong>${expiry}</strong>.</p>
      <p>— ${listing.food_name}</p>
    </div>
  `;

  return { subject, text, html };
}


