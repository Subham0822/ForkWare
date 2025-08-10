// Test authentication status
// Run this in your browser console

// First, make sure you're on your app's domain
const { createClient } = require("@supabase/supabase-js");

// Replace with your actual Supabase URL and anon key
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log("Testing authentication...");

    // Check current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log("Session:", session);
    console.log("User ID:", session?.user?.id);
    console.log("User email:", session?.user?.email);

    if (sessionError) {
      console.error("Session error:", sessionError);
    }

    // Test if we can read from food_listings
    const { data: listings, error: listingsError } = await supabase
      .from("food_listings")
      .select("*")
      .limit(1);

    console.log("Listings test:", listings);
    if (listingsError) {
      console.error("Listings error:", listingsError);
    }

    // Test if we can insert (this will fail but show us the error)
    const testInsert = {
      user_id: session?.user?.id,
      food_name: "Test Food",
      quantity: "1 unit",
      expiry_date: "in 1 hour",
      pickup_location: "Test Location",
      status: "available",
    };

    console.log("Testing insert with:", testInsert);

    const { data: insertData, error: insertError } = await supabase
      .from("food_listings")
      .insert([testInsert])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      console.log("Insert successful:", insertData);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAuth();
