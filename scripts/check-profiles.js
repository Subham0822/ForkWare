// Check what profiles exist in the system
const { createClient } = require("@supabase/supabase-js");

// Check for environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfiles() {
  try {
    console.log("🔍 Checking profiles table...");

    // Check if profiles table exists
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(10);

    if (error) {
      console.error("❌ Error accessing profiles table:", error.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log("📝 No profiles found. We need to create one first.");
      console.log("💡 Creating a system profile for events...");

      // Create a system profile
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          name: "System Events",
          email: "system@forkware.com",
          role: "Admin",
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (createError) {
        console.error(
          "❌ Failed to create system profile:",
          createError.message
        );
        return;
      }

      console.log("✅ Created system profile:", newProfile[0]);
      console.log("🆔 Use this ID for organizer_id:", newProfile[0].id);
    } else {
      console.log(`📊 Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(
          `  ${index + 1}. ${profile.name} (${profile.email}) - Role: ${
            profile.role
          } - ID: ${profile.id}`
        );
      });

      console.log("\n💡 Use any of these IDs for organizer_id in events");
    }
  } catch (error) {
    console.error("❌ Error checking profiles:", error.message);
  }
}

checkProfiles();
