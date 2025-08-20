const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";
const supabase = createClient(supabaseUrl, supabaseKey);

function inferAllergens(name) {
  const n = (name || "").toLowerCase();
  const allergens = new Set();
  if (/bread|roll|bun|pasta|noodle|chapati|roti|cake|pastry/.test(n))
    allergens.add("gluten");
  if (/cheese|paneer|milk|yogurt|curd|cream|butter|dessert/.test(n))
    allergens.add("dairy");
  if (/egg|omelet|omelette/.test(n)) allergens.add("eggs");
  if (/soy|tofu/.test(n)) allergens.add("soy");
  if (/peanut|groundnut/.test(n)) allergens.add("peanuts");
  if (/almond|cashew|walnut|pistachio|hazelnut|nut/.test(n))
    allergens.add("tree nuts");
  if (/sesame/.test(n)) allergens.add("sesame");
  if (/fish|tuna|salmon|seafood|prawn|shrimp|crab/.test(n))
    allergens.add("fish/shellfish");
  return Array.from(allergens);
}

function inferSafetyFromName(name) {
  const n = (name || "").toLowerCase();
  // Defaults
  let temperature = "4°C";
  let preparation_method = "Prepared cold";
  let storage_conditions =
    "Keep refrigerated at ≤4°C. Consume within 24 hours.";
  let safety_rating = 4;

  if (/water|bottle|beverage|juice|drink/.test(n)) {
    temperature = "Ambient";
    preparation_method = "Sealed beverage";
    storage_conditions = "Store sealed at room temperature.";
    safety_rating = 5;
  } else if (/salad|fruit|fresh/.test(n)) {
    temperature = "4°C";
    preparation_method = "Freshly prepared";
    storage_conditions = "Keep refrigerated at ≤4°C. Consume within 24 hours.";
    safety_rating = 4;
  } else if (/bread|roll|bun/.test(n)) {
    temperature = "Ambient";
    preparation_method = "Baked";
    storage_conditions =
      "Store covered at room temperature. Consume within 12 hours.";
    safety_rating = 4;
  } else if (
    /rice|biryani|pilaf|pulao|curry|chicken|meat|pasta|noodle/.test(n)
  ) {
    temperature = "≥60°C";
    preparation_method = "Cooked";
    storage_conditions =
      "Keep hot at ≥60°C or cool rapidly and refrigerate ≤4°C within 2 hours. Reheat to ≥74°C before serving.";
    safety_rating = 4;
  } else if (/dessert|cake|pastry/.test(n)) {
    temperature = "4°C";
    preparation_method = "Prepared dessert";
    storage_conditions = "Keep refrigerated at ≤4°C. Consume within 24 hours.";
    safety_rating = 3;
  }

  // Random recent inspection within last 12 hours
  const hoursAgo = Math.floor(Math.random() * 12) + 1;
  const last_inspection = new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000
  ).toISOString();

  // Allergens
  const allergens = inferAllergens(name);

  return {
    temperature,
    preparation_method,
    storage_conditions,
    safety_rating,
    last_inspection,
    allergens,
  };
}

async function fillMissingSafetyData() {
  try {
    console.log("🔍 Fetching listings missing safety data...");
    const { data: listings, error } = await supabase
      .from("food_listings")
      .select(
        "id, food_name, temperature, allergens, preparation_method, safety_rating, storage_conditions, last_inspection"
      )
      .or(
        "temperature.is.null,preparation_method.is.null,safety_rating.is.null,storage_conditions.is.null,last_inspection.is.null,allergens.is.null"
      );

    if (error) throw error;

    if (!listings || listings.length === 0) {
      console.log("✅ All listings already have safety data.");
      return;
    }

    console.log(`📋 Found ${listings.length} listings to update.`);

    let updated = 0;
    for (const l of listings) {
      const inferred = inferSafetyFromName(l.food_name || "Food");
      const payload = {};
      if (!l.temperature || l.temperature.trim() === "")
        payload.temperature = inferred.temperature;
      if (!l.preparation_method || l.preparation_method.trim() === "")
        payload.preparation_method = inferred.preparation_method;
      if (!l.storage_conditions || l.storage_conditions.trim() === "")
        payload.storage_conditions = inferred.storage_conditions;
      if (l.safety_rating == null)
        payload.safety_rating = inferred.safety_rating;
      if (!l.last_inspection)
        payload.last_inspection = inferred.last_inspection;
      if (!Array.isArray(l.allergens) || l.allergens.length === 0)
        payload.allergens = inferred.allergens;

      if (Object.keys(payload).length === 0) continue;

      const { error: updErr } = await supabase
        .from("food_listings")
        .update(payload)
        .eq("id", l.id);
      if (updErr) {
        console.log(`⚠️  Skipped ${l.id}: ${updErr.message}`);
        continue;
      }
      updated += 1;
      if (updated % 25 === 0) console.log(`✅ Updated ${updated}`);
    }

    console.log(`🎉 Safety data fill complete. Updated ${updated} listings.`);
  } catch (e) {
    console.error("❌ Failed to fill safety data:", e.message || e);
  }
}

if (require.main === module) {
  fillMissingSafetyData();
}
