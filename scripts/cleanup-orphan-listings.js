const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOrphanListings() {
  try {
    console.log(
      "🔍 Finding orphan food_listings (event_id points to deleted events)..."
    );

    // Fetch all existing event IDs
    const { data: events, error: eventsErr } = await supabase
      .from("events")
      .select("id");
    if (eventsErr) throw eventsErr;

    const validIds = new Set((events || []).map((e) => e.id));

    // Fetch listings with an event_id
    const { data: listings, error: listErr } = await supabase
      .from("food_listings")
      .select("id,event_id")
      .not("event_id", "is", null);
    if (listErr) throw listErr;

    const orphans = (listings || []).filter((l) => !validIds.has(l.event_id));

    if (orphans.length === 0) {
      console.log("✅ No orphan listings found.");
      return;
    }

    console.log(`⚠️  Found ${orphans.length} orphan listings. Detaching...`);

    // Batch update in chunks
    const chunkSize = 100;
    for (let i = 0; i < orphans.length; i += chunkSize) {
      const chunk = orphans.slice(i, i + chunkSize).map((l) => l.id);
      const { error: updErr } = await supabase
        .from("food_listings")
        .update({ event_id: null })
        .in("id", chunk);
      if (updErr) throw updErr;
      console.log(`✅ Detached ${chunk.length} listings`);
    }

    console.log("🎉 Cleanup complete.");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message || err);
  }
}

if (require.main === module) {
  cleanupOrphanListings();
}
