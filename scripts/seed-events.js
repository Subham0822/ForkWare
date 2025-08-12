// Seed sample events for demo purposes
// Usage: node scripts/seed-events.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  try {
    console.log("Seeding sample events...");

    // Attempt to fetch an organizer profile for organizer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email")
      .limit(1)
      .single();

    const organizerId = profile?.id || "00000000-0000-0000-0000-000000000000";

    const today = new Date();
    const yyyy = today.getFullYear();
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const dayOffset = (n) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

    const events = [
      {
        name: "TechFest 2025",
        description: "Annual university tech festival",
        date: fmt(dayOffset(7)),
        start_time: "10:00",
        end_time: "18:00",
        venue: "Heritage Ground",
        venue_address: "Campus Central Avenue",
        organizer_id: organizerId,
        organizer_name: "Campus Admin",
        organizer_contact: profile?.email || "admin@university.edu",
        expected_meals: { veg: 500, non_veg: 300, total: 800 },
        food_vendor: "GreenBite Caterers",
        status: "upcoming",
        expected_attendees: 1200,
        food_serving_time: "13:00",
        surplus_management_contact: "Canteen Desk",
        auto_notify_ngos: true,
        ngo_auto_reserve_minutes: 30,
        default_surplus_expiry_minutes: 180,
        notify_radius_km: 5,
        trusted_ngo_ids: [],
      },
      {
        name: "Alumni Meet Gala",
        description: "Evening gala with buffet",
        date: fmt(dayOffset(1)),
        start_time: "17:00",
        end_time: "22:00",
        venue: "Convention Hall",
        venue_address: "North Block",
        organizer_id: organizerId,
        organizer_name: "Alumni Office",
        organizer_contact: profile?.email || "alumni@university.edu",
        expected_meals: { veg: 350, non_veg: 250, total: 600 },
        food_vendor: "TasteCraft",
        status: "upcoming",
        expected_attendees: 700,
        food_serving_time: "19:30",
        surplus_management_contact: "Front Desk",
        auto_notify_ngos: true,
        ngo_auto_reserve_minutes: 15,
        default_surplus_expiry_minutes: 150,
        notify_radius_km: 8,
        trusted_ngo_ids: [],
      },
      {
        name: "Cultural Night",
        description: "Music and dance performances with snacks",
        date: fmt(dayOffset(-2)),
        start_time: "16:00",
        end_time: "21:00",
        venue: "Open Air Theatre",
        venue_address: "South Lawn",
        organizer_id: organizerId,
        organizer_name: "Student Affairs",
        organizer_contact: profile?.email || "events@university.edu",
        expected_meals: { veg: 200, non_veg: 100, total: 300 },
        food_vendor: "SnackHub",
        status: "completed",
        expected_attendees: 500,
        food_serving_time: "18:30",
        surplus_management_contact: "Backstage Desk",
        auto_notify_ngos: true,
        ngo_auto_reserve_minutes: 0,
        default_surplus_expiry_minutes: 120,
        notify_radius_km: 5,
        trusted_ngo_ids: [],
      },
    ];

    const { data, error } = await supabase
      .from("events")
      .insert(events)
      .select();
    if (error) throw error;

    console.log(`Inserted ${data.length} sample events.`);
    console.log(data.map((e) => `${e.name} (${e.id})`).join("\n"));
    console.log("Done.");
  } catch (err) {
    console.error("Seed failed:", err.message || err);
    process.exit(1);
  }
}

seed();
