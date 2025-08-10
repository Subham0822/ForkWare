// Test script to check database connection and table existence
// Run this in your browser console or as a Node.js script

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log("Testing database connection...");

    // Test 1: Check if we can connect
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log("Session:", session ? "Authenticated" : "Not authenticated");
    if (sessionError) console.error("Session error:", sessionError);

    // Test 2: Check if food_listings table exists
    const { data: tableTest, error: tableError } = await supabase
      .from("food_listings")
      .select("count")
      .limit(1);

    if (tableError) {
      console.error("Table error:", tableError);
      if (tableError.code === "42P01") {
        console.error("❌ The food_listings table does not exist!");
        console.log("Please run the SQL migration from supabase-migration.sql");
      }
    } else {
      console.log("✅ food_listings table exists");
    }

    // Test 3: Check if profiles table exists
    const { data: profilesTest, error: profilesError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (profilesError) {
      console.error("Profiles table error:", profilesError);
    } else {
      console.log("✅ profiles table exists");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testDatabase();
