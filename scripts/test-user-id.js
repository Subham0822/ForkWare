// Test script to debug user ID retrieval
// Run this in your browser console to see what's happening

async function testUserIdRetrieval() {
  console.log("=== Testing User ID Retrieval ===");

  try {
    // Test 1: Try to get from custom JWT session
    console.log("1. Testing custom JWT session...");
    try {
      const { getSession } = await import("@/app/actions/auth-supabase");
      const customSession = await getSession();
      console.log("Custom session:", customSession);
      console.log("User object:", customSession?.user);
      console.log("User ID:", customSession?.user?.id);
    } catch (error) {
      console.error("Custom session error:", error);
    }

    // Test 2: Try to get from Supabase session
    console.log("\n2. Testing Supabase session...");
    try {
      const { createClient } = await import("@supabase/supabase-js");

      // You'll need to replace these with your actual values
      const supabaseUrl = "YOUR_SUPABASE_URL";
      const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

      if (supabaseUrl !== "YOUR_SUPABASE_URL") {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("Supabase session:", session);
        console.log("Supabase user ID:", session?.user?.id);
        if (error) console.error("Supabase error:", error);
      } else {
        console.log(
          "Please update supabaseUrl and supabaseAnonKey with your actual values"
        );
      }
    } catch (error) {
      console.error("Supabase session error:", error);
    }

    // Test 3: Check if we're logged in
    console.log("\n3. Checking authentication status...");
    try {
      // Check if session cookie exists
      const cookies = document.cookie.split(";");
      const sessionCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("session=")
      );
      console.log("Session cookie exists:", !!sessionCookie);
      if (sessionCookie) {
        console.log("Session cookie length:", sessionCookie.length);
      }
    } catch (error) {
      console.error("Cookie check error:", error);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testUserIdRetrieval();
