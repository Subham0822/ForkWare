import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  desired_role?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodListing {
  id: string;
  user_id: string;
  food_name: string;
  quantity: string;
  expiry_date: string;
  pickup_location: string;
  status: "available" | "picked_up" | "expired";
  image_url?: string;
  created_at: string;
  // Food Safety Fields
  temperature?: string;
  allergens?: string[];
  preparation_method?: string;
  safety_rating?: number; // 1-5 scale
  storage_conditions?: string;
  last_inspection?: string;
  // Event Integration Fields
  event_id?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_address?: string;
  organizer_id: string;
  organizer_name: string;
  organizer_contact: string;
  expected_meals: {
    veg: number;
    non_veg: number;
    total: number;
  };
  food_vendor?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  // Additional fields for better event management
  expected_attendees?: number;
  food_serving_time?: string;
  surplus_management_contact?: string;
  auto_notify_ngos?: boolean;
  ngo_auto_reserve_minutes?: number;
  // Event-level defaults and preferences
  default_surplus_expiry_minutes?: number; // Prefill expiry for posted batches
  notify_radius_km?: number; // Limit NGO notifications by distance
  trusted_ngo_ids?: string[]; // For optional auto-reserve
  // Event branding
  image_url?: string; // Event logo/image
}

// Narrow input for registration convenience
export interface EventRegistrationInput {
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  venue: string;
  venue_address?: string;
  organizer_id: string;
  organizer_name: string;
  organizer_contact: string;
  expected_meals: {
    veg: number;
    non_veg: number;
    total?: number; // computed if omitted
  };
  food_vendor?: string;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
  expected_attendees?: number;
  food_serving_time?: string; // HH:mm
  surplus_management_contact?: string;
  auto_notify_ngos?: boolean;
  ngo_auto_reserve_minutes?: number;
  default_surplus_expiry_minutes?: number;
  notify_radius_km?: number;
  trusted_ngo_ids?: string[];
}

// Input for posting surplus for an event (one batch)
export interface EventSurplusBatchInput {
  user_id: string; // caterer/staff posting
  food_name: string;
  quantity: string;
  pickup_location: string;
  expiry_date?: string; // if omitted, will be prefilled using event defaults
  status?: "available" | "picked_up" | "expired";
  image_url?: string;
  // Food safety (optional)
  temperature?: string;
  allergens?: string[];
  preparation_method?: string;
  safety_rating?: number;
  storage_conditions?: string;
  last_inspection?: string;
}

export interface EventSummary {
  event: Event;
  totals: {
    totalListings: number;
    available: number;
    pickedUp: number;
    expired: number;
  };
  quantities: {
    total: number;
    available: number;
    pickedUp: number;
    expired: number;
  };
  mealsServedEstimate: number; // naive estimate from numeric quantities picked up
}

// User management functions
export async function createUser(
  userData: Omit<User, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    // If no user found, return null instead of throwing
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }
  return data;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Food listing functions
export async function createFoodListing(
  listingData: Omit<FoodListing, "id" | "created_at">
) {
  console.log("createFoodListing called with:", listingData);

  const { data, error } = await supabase
    .from("food_listings")
    .insert([listingData])
    .select()
    .single();

  if (error) {
    // Improve error visibility for client consoles that stringify objects poorly
    try {
      console.error("Supabase error in createFoodListing:", error);
      console.error("Error details:", {
        message: (error as any)?.message,
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
    } catch {}
    throw new Error((error as any)?.message || "Failed to create listing");
  }

  console.log("createFoodListing successful:", data);
  return data;
}

export async function getFoodListings(status?: string) {
  let query = supabase
    .from("food_listings")
    .select(
      `
      *,
      profiles:user_id (name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateFoodListing(
  id: string,
  updates: Partial<FoodListing>
) {
  const { data, error } = await supabase
    .from("food_listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFoodListing(id: string) {
  const { error } = await supabase.from("food_listings").delete().eq("id", id);

  if (error) throw error;
}

// Event management functions
export async function createEvent(
  eventData: Omit<Event, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("events")
    .insert([eventData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllEvents(status?: string) {
  let query = supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
}

export async function getEventsByOrganizer(organizerId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .in("status", ["upcoming", "ongoing"])
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getFoodListingsByEvent(eventId: string) {
  const { data, error } = await supabase
    .from("food_listings")
    .select(
      `
      *,
      profiles:user_id (name, email)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// --------------- Event Integration helpers ---------------

// Determine event status relative to now, used for registration default
function computeEventStatus(
  date: string,
  startTime: string,
  endTime: string
): "upcoming" | "ongoing" | "completed" {
  try {
    const now = new Date();
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "upcoming";
    }
    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  } catch {
    return "upcoming";
  }
}

// Compute default expiry for a batch based on event configuration
export function getEventPrefillExpiryDate(
  event: Event,
  postedAt?: Date
): string {
  const baseNow = postedAt ?? new Date();
  const defaultMinutes = event.default_surplus_expiry_minutes ?? 180; // 3h default

  // If a food serving time is provided use that as a base; else use now
  let baseTime: Date = baseNow;
  if (event.food_serving_time) {
    const candidate = new Date(`${event.date}T${event.food_serving_time}`);
    if (!Number.isNaN(candidate.getTime())) {
      baseTime = candidate;
    }
  }

  // Ensure expiry is not in the past relative to when the post happens
  const effectiveBase = baseTime < baseNow ? baseNow : baseTime;
  const expiry = new Date(effectiveBase.getTime() + defaultMinutes * 60 * 1000);
  return expiry.toISOString();
}

// Convenience: register an event with sensible defaults
export async function registerEvent(
  input: EventRegistrationInput
): Promise<Event> {
  const computedTotal =
    input.expected_meals.total ??
    (input.expected_meals.veg || 0) + (input.expected_meals.non_veg || 0);

  const status =
    input.status ??
    computeEventStatus(input.date, input.start_time, input.end_time);

  const payload: Omit<Event, "id" | "created_at" | "updated_at"> = {
    name: input.name,
    description: input.description,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time,
    venue: input.venue,
    venue_address: input.venue_address,
    organizer_id: input.organizer_id,
    organizer_name: input.organizer_name,
    organizer_contact: input.organizer_contact,
    expected_meals: {
      veg: input.expected_meals.veg || 0,
      non_veg: input.expected_meals.non_veg || 0,
      total: computedTotal,
    },
    food_vendor: input.food_vendor,
    status,
    expected_attendees: input.expected_attendees,
    food_serving_time: input.food_serving_time,
    surplus_management_contact: input.surplus_management_contact,
    auto_notify_ngos: input.auto_notify_ngos ?? true,
    ngo_auto_reserve_minutes: input.ngo_auto_reserve_minutes,
    default_surplus_expiry_minutes: input.default_surplus_expiry_minutes,
    notify_radius_km: input.notify_radius_km,
    trusted_ngo_ids: input.trusted_ngo_ids,
  };

  const created = await createEvent(payload);
  return created;
}

// Post a surplus batch for a specific event with prefilled expiry support
export async function postSurplusForEvent(
  eventId: string,
  batch: EventSurplusBatchInput,
  options?: { prefillExpiry?: boolean }
): Promise<FoodListing> {
  const event = await getEventById(eventId);

  // Ensure we have a valid user_id for FK and potential RLS policies
  const effectiveUserId = batch.user_id || event.organizer_id;

  const expiry =
    batch.expiry_date ??
    (options?.prefillExpiry ?? true
      ? getEventPrefillExpiryDate(event)
      : undefined);

  const listingPayload: Omit<FoodListing, "id" | "created_at"> = {
    user_id: effectiveUserId,
    food_name: batch.food_name,
    quantity: batch.quantity,
    expiry_date:
      expiry || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // fallback 2h
    pickup_location: batch.pickup_location,
    status: batch.status ?? "available",
    image_url: batch.image_url,
    temperature: batch.temperature,
    allergens: batch.allergens,
    preparation_method: batch.preparation_method,
    safety_rating: batch.safety_rating,
    storage_conditions: batch.storage_conditions,
    last_inspection: batch.last_inspection,
    event_id: eventId,
  };

  return await createFoodListing(listingPayload);
}

// Fetch event with its listings for dashboard grouping
export async function getEventWithListings(eventId: string) {
  const [event, listings] = await Promise.all([
    getEventById(eventId),
    getFoodListingsByEvent(eventId),
  ]);

  return { event, listings };
}

// Mark event completed and optionally expire any unclaimed listings
export async function finalizeEvent(
  eventId: string,
  options?: { expireUnclaimed?: boolean; markCompleted?: boolean }
) {
  const expireUnclaimed = options?.expireUnclaimed ?? true;
  const markCompleted = options?.markCompleted ?? true;

  if (expireUnclaimed) {
    const { error: expireError } = await supabase
      .from("food_listings")
      .update({ status: "expired" })
      .eq("event_id", eventId)
      .eq("status", "available");
    if (expireError) throw expireError;
  }

  if (markCompleted) {
    await updateEvent(eventId, { status: "completed" });
  }
}

// Compute a lightweight post-event summary
export async function getEventSummary(eventId: string): Promise<EventSummary> {
  const event = await getEventById(eventId);
  const listings = await getFoodListingsByEvent(eventId);

  const totals = {
    totalListings: listings.length,
    available: listings.filter((l) => l.status === "available").length,
    pickedUp: listings.filter((l) => l.status === "picked_up").length,
    expired: listings.filter((l) => l.status === "expired").length,
  };

  const sumNumeric = (items: FoodListing[]) =>
    items.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0);

  const quantities = {
    total: sumNumeric(listings),
    available: sumNumeric(listings.filter((l) => l.status === "available")),
    pickedUp: sumNumeric(listings.filter((l) => l.status === "picked_up")),
    expired: sumNumeric(listings.filter((l) => l.status === "expired")),
  };

  const mealsServedEstimate = quantities.pickedUp; // 1 unit ~= 1 meal, UI can reinterpret

  return { event, totals, quantities, mealsServedEstimate };
}

// Identify NGOs to notify (basic: verified NGOs by role).
// Location filtering can be added later when profile geodata is available.
export async function getNgosToNotifyForEvent(eventId: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const event = await getEventById(eventId);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("role", "NGO")
    .eq("verified", true);
  if (error) throw error;
  return data;
}

// Placeholder to trigger push notifications via future mechanism
export async function notifyNgosAboutEventListing(
  eventId: string,
  listingId: string
): Promise<void> {
  const ngos = await getNgosToNotifyForEvent(eventId);
  console.log("Notify NGOs about listing", { listingId, ngos });
}

// Placeholder: auto-reserve for trusted NGOs after a grace period
export function getAutoReserveDeadline(event: Event): string | undefined {
  const minutes = event.ngo_auto_reserve_minutes;
  if (!minutes || minutes <= 0) return undefined;
  const deadline = new Date(Date.now() + minutes * 60 * 1000);
  return deadline.toISOString();
}
