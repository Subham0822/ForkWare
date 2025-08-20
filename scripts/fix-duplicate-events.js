const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicateEvents() {
  try {
    console.log("🔍 Checking for duplicate events...");
    console.log("==================================");

    // Get all events
    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      console.log("ℹ️  No events found");
      return;
    }

    console.log(`📊 Found ${events.length} total events`);

    // Find duplicates by name and date
    const duplicates = [];
    const seen = new Map();

    events.forEach((event) => {
      const key = `${event.name}-${event.date}`;
      if (seen.has(key)) {
        duplicates.push({
          original: seen.get(key),
          duplicate: event,
        });
      } else {
        seen.set(key, event);
      }
    });

    if (duplicates.length === 0) {
      console.log("✅ No duplicate events found!");
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate event pairs:`);
    console.log("================================================");

    duplicates.forEach((pair, index) => {
      console.log(`\n${index + 1}. Duplicate: ${pair.duplicate.name}`);
      console.log(`   📅 Date: ${pair.duplicate.date}`);
      console.log(`   🆔 ID: ${pair.duplicate.id}`);
      console.log(`   📝 Created: ${pair.duplicate.created_at}`);
      console.log(`   Original ID: ${pair.original.id}`);
      console.log(`   Original Created: ${pair.original.created_at}`);
    });

    // Ask user if they want to remove duplicates
    console.log("\n🔧 Options to fix duplicates:");
    console.log("1. Remove all duplicate events (keep the oldest)");
    console.log("2. Remove all duplicate events (keep the newest)");
    console.log("3. Skip fixing (manual review required)");

    // For automation, we'll remove duplicates keeping the oldest (most likely the original)
    console.log("\n🔄 Automatically removing duplicates (keeping oldest)...");

    let removedCount = 0;
    for (const pair of duplicates) {
      try {
        const { error: deleteError } = await supabase
          .from("events")
          .delete()
          .eq("id", pair.duplicate.id);

        if (deleteError) {
          console.log(
            `⚠️  Failed to remove duplicate ${pair.duplicate.name}: ${deleteError.message}`
          );
        } else {
          console.log(
            `✅ Removed duplicate: ${pair.duplicate.name} (ID: ${pair.duplicate.id})`
          );
          removedCount++;
        }
      } catch (error) {
        console.log(
          `⚠️  Error removing duplicate ${pair.duplicate.name}: ${error.message}`
        );
      }
    }

    console.log(`\n🎉 Successfully removed ${removedCount} duplicate events!`);

    // Verify the fix
    console.log("\n🔍 Verifying fix...");
    const { data: remainingEvents, error: verifyError } = await supabase
      .from("events")
      .select("id, name, date")
      .order("created_at", { ascending: true });

    if (verifyError) {
      console.log("⚠️  Could not verify remaining events");
    } else {
      console.log(`✅ Remaining events: ${remainingEvents.length}`);

      // Check for any remaining duplicates
      const remainingSeen = new Set();
      const remainingDuplicates = [];

      remainingEvents.forEach((event) => {
        const key = `${event.name}-${event.date}`;
        if (remainingSeen.has(key)) {
          remainingDuplicates.push(event);
        } else {
          remainingSeen.add(key);
        }
      });

      if (remainingDuplicates.length === 0) {
        console.log("✅ No remaining duplicates found!");
      } else {
        console.log(
          `⚠️  Still found ${remainingDuplicates.length} duplicates - manual review needed`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error fixing duplicate events:", error.message);
  }
}

// Run the function
if (require.main === module) {
  fixDuplicateEvents()
    .then(() => {
      console.log("\n✨ Duplicate events fix completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Duplicate events fix failed:", error);
      process.exit(1);
    });
}

module.exports = { fixDuplicateEvents };
