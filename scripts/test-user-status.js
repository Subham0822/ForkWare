// Test your current user status
// Run this in your browser console on your app

// Get the supabase client from your app
// You can find this in your browser's Network tab or by checking your app's source

async function testUserStatus() {
  try {
    console.log("=== Testing User Status ===");

    // Check if supabase is available
    if (typeof window !== "undefined" && window.supabase) {
      const supabase = window.supabase;

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Session:", session);
      console.log("User ID:", session?.user?.id);
      console.log("User Email:", session?.user?.email);

      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (session?.user?.id) {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        console.log("Profile:", profile);
        if (profileError) {
          console.error("Profile error:", profileError);
        }
      } else {
        console.log("No authenticated user found");
      }
    } else {
      console.log("Supabase client not found in window object");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testUserStatus();

