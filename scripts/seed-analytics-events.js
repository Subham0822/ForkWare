const { createClient } = require("@supabase/supabase-js");

// Use service role to bypass RLS and use admin API
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";
const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureOrganizerProfile() {
  // Try to reuse an existing profile
  const { data: existing, error: findErr } = await supabase
    .from("profiles")
    .select("id, name, email")
    .limit(1)
    .maybeSingle();

  if (!findErr && existing) {
    console.log(
      `👤 Using existing organizer profile: ${existing.name || existing.email}`
    );
    return existing;
  }

  console.log(
    "👤 No profiles found, creating an organizer user via admin API..."
  );
  const email = `organizer_${Math.floor(Math.random() * 100000)}@example.com`;
  const password = `TempPass!${Math.floor(Math.random() * 1000000)}`;

  // Create auth user (requires service role)
  const { data: adminRes, error: adminErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Default Organizer" },
    });
  if (adminErr || !adminRes?.user) {
    throw new Error(
      `Failed to create auth user: ${adminErr?.message || "unknown"}`
    );
  }

  const user = adminRes.user;
  // Upsert into profiles with the same id (FK to auth.users.id)
  const profilePayload = {
    id: user.id,
    name: user.user_metadata?.name || "Default Organizer",
    email: user.email,
    role: "Organizer",
    verified: true,
  };

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("id, name, email")
    .single();

  if (profileErr) {
    throw new Error(`Failed to upsert profile: ${profileErr.message}`);
  }

  console.log(`✅ Created organizer profile: ${profile.name}`);
  return profile;
}

function buildEvents(organizer) {
  const baseEvents = [
    // Completed events
    {
      name: "Corporate Leadership Summit 2024",
      date: "2024-11-15",
      status: "completed",
      venue: "Grand Conference Center",
      start_time: "09:00:00",
      end_time: "17:00:00",
      expected_attendees: 250,
      expected_meals: { veg: 120, non_veg: 130, total: 250 },
      description:
        "Annual leadership conference with networking lunch and dinner",
    },
    {
      name: "Community Food Festival 2024",
      date: "2024-11-20",
      status: "completed",
      venue: "Central Park",
      start_time: "12:00:00",
      end_time: "20:00:00",
      expected_attendees: 400,
      expected_meals: { veg: 250, non_veg: 150, total: 400 },
      description: "Community celebration with food vendors and entertainment",
    },
    {
      name: "Tech Innovation Workshop 2024",
      date: "2024-11-25",
      status: "completed",
      venue: "Tech Hub Campus",
      start_time: "10:00:00",
      end_time: "16:00:00",
      expected_attendees: 180,
      expected_meals: { veg: 100, non_veg: 80, total: 180 },
      description: "Hands-on workshop with refreshments and networking",
    },
    // Upcoming events
    {
      name: "Winter Business Summit 2025",
      date: "2025-01-20",
      status: "upcoming",
      venue: "Business Center",
      start_time: "09:00:00",
      end_time: "17:00:00",
      expected_attendees: 200,
      expected_meals: { veg: 100, non_veg: 100, total: 200 },
      description: "Strategic planning summit with full catering service",
    },
    {
      name: "Spring Community Picnic 2025",
      date: "2025-02-15",
      status: "upcoming",
      venue: "Community Gardens",
      start_time: "11:00:00",
      end_time: "19:00:00",
      expected_attendees: 350,
      expected_meals: { veg: 200, non_veg: 150, total: 350 },
      description: "Family-friendly picnic with food trucks and activities",
    },
    {
      name: "AI in Food Safety Symposium 2025",
      date: "2025-02-20",
      status: "upcoming",
      venue: "Research Institute",
      start_time: "08:30:00",
      end_time: "17:30:00",
      expected_attendees: 250,
      expected_meals: { veg: 150, non_veg: 100, total: 250 },
      description: "Cutting-edge symposium on AI applications in food safety",
    },
  ];

  return baseEvents.map((e) => ({
    ...e,
    organizer_id: organizer.id,
    organizer_name: organizer.name,
    organizer_contact: organizer.email,
  }));
}

async function insertEvents(events) {
  const created = [];
  for (const ev of events) {
    const { data, error } = await supabase
      .from("events")
      .insert(ev)
      .select()
      .single();
    if (error) {
      console.log(`⚠️  Event ${ev.name}: ${error.message}`);
    } else {
      console.log(`✅ Event created: ${data.name} (${data.status})`);
      created.push(data);
    }
  }
  return created;
}

function buildListingsForEvent(event) {
  const baseItems = [
    {
      food_name: "Vegetarian Pasta",
      quantity: `${Math.floor(Math.random() * 60) + 40} servings`,
    },
    {
      food_name: "Chicken Curry",
      quantity: `${Math.floor(Math.random() * 50) + 30} servings`,
    },
    {
      food_name: "Fresh Salad",
      quantity: `${Math.floor(Math.random() * 70) + 30} bowls`,
    },
    {
      food_name: "Rice Pilaf",
      quantity: `${Math.floor(Math.random() * 80) + 40} portions`,
    },
    {
      food_name: "Fruit Platter",
      quantity: `${Math.floor(Math.random() * 20) + 10} platters`,
    },
    {
      food_name: "Bread Rolls",
      quantity: `${Math.floor(Math.random() * 120) + 60} pieces`,
    },
    {
      food_name: "Water Bottles",
      quantity: `${Math.floor(Math.random() * 150) + 80} bottles`,
    },
  ];

  const now = Date.now();
  return baseItems.map((item) => ({
    user_id: event.organizer_id,
    event_id: event.id,
    food_name: item.food_name,
    quantity: item.quantity,
    expiry_date: new Date(
      now + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
    ).toISOString(),
    pickup_location: event.venue,
    status:
      event.status === "completed"
        ? Math.random() > 0.3
          ? "picked_up"
          : "expired"
        : "available",
    image_url: null,
  }));
}

async function insertListingsForEvents(events) {
  for (const ev of events) {
    const payload = buildListingsForEvent(ev);
    const { error } = await supabase.from("food_listings").insert(payload);
    if (error) {
      console.log(`⚠️  Listings for ${ev.name} failed: ${error.message}`);
    } else {
      console.log(`🍽️  Listings created for ${ev.name}: ${payload.length}`);
    }
  }
}

async function main() {
  try {
    console.log("🚀 Seeding analytics data...");
    console.log("===========================");

    const organizer = await ensureOrganizerProfile();
    const events = buildEvents(organizer);
    const createdEvents = await insertEvents(events);

    if (createdEvents.length === 0) {
      console.log("❌ No events were created. Aborting listings.");
      return;
    }

    await insertListingsForEvents(createdEvents);

    console.log("\n🎉 Seeding complete! Open the Analytics page to view data.");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message || err);
  }
}

if (require.main === module) {
  main();
}
