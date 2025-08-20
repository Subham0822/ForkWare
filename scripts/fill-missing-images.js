const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";
const supabase = createClient(supabaseUrl, supabaseKey);

function keywordForFood(name) {
  const n = (name || "").toLowerCase();
  if (/chicken/.test(n)) return "chicken meal";
  if (/curry/.test(n)) return "curry";
  if (/rice|biryani|pilaf|pulao/.test(n)) return "rice dish";
  if (/pasta|noodle/.test(n)) return "pasta";
  if (/salad/.test(n)) return "salad";
  if (/bread|roll|bun/.test(n)) return "bread";
  if (/fruit/.test(n)) return "fruit platter";
  if (/water|bottle|beverage|juice|drink/.test(n)) return "beverage";
  if (/dessert|cake|pastry|sweet/.test(n)) return "dessert";
  return "food";
}

function buildUnsplashUrl(keyword) {
  // Random but reproducible per keyword
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(
    keyword
  )},food`;
}

async function fillMissingImages() {
  try {
    console.log("🔍 Fetching listings without images...");
    const { data: listings, error } = await supabase
      .from("food_listings")
      .select("id, food_name, image_url")
      .or("image_url.is.null,image_url.eq.");

    if (error) throw error;

    if (!listings || listings.length === 0) {
      console.log("✅ No missing images found.");
      return;
    }

    console.log(`📋 Found ${listings.length} listings to update.`);

    let updated = 0;
    for (const l of listings) {
      const kw = keywordForFood(l.food_name);
      const url = buildUnsplashUrl(kw);
      const { error: updErr } = await supabase
        .from("food_listings")
        .update({ image_url: url })
        .eq("id", l.id);
      if (updErr) {
        console.log(`⚠️  Skipped ${l.id}: ${updErr.message}`);
        continue;
      }
      updated += 1;
      if (updated % 25 === 0) console.log(`✅ Updated ${updated}`);
    }

    console.log(`🎉 Image fill complete. Updated ${updated} listings.`);
  } catch (e) {
    console.error("❌ Failed to fill images:", e.message || e);
  }
}

if (require.main === module) {
  fillMissingImages();
}
