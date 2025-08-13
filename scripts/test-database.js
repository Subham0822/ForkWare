// Test database connectivity and check for food listings
const { createClient } = require("@supabase/supabase-js");

// Check for environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars"
  );
  console.log(
    'Please run with: $env:NEXT_PUBLIC_SUPABASE_URL="YOUR_URL"; $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_KEY"; node scripts/test-database.js'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabase() {
  try {
    console.log("🔍 Testing database connectivity...");

    // Test 1: Check if we can connect to Supabase
    console.log("1. Testing Supabase connection...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    if (authError) {
      console.log(
        "⚠️  Auth check failed (this might be normal for public access):",
        authError.message
      );
    } else {
      console.log("✅ Supabase connection successful");
    }

    // Test 2: Check if food_listings table exists and has data
    console.log("\n2. Checking food_listings table...");
    const { data: foodListings, error: foodError } = await supabase
      .from("food_listings")
      .select("*")
      .limit(5);

    if (foodError) {
      console.error(
        "❌ Error accessing food_listings table:",
        foodError.message
      );
      if (
        foodError.message.includes("relation") &&
        foodError.message.includes("does not exist")
      ) {
        console.log(
          "💡 The food_listings table doesn't exist. You need to run the database setup first."
        );
        console.log(
          "   Check the docs/setup/ folder for database setup instructions."
        );
      }
      return;
    }

    console.log(`✅ food_listings table accessible`);
    console.log(`📊 Found ${foodListings.length} food listings in database`);

    if (foodListings.length === 0) {
      console.log(
        "💡 No food listings found. You need to run the seeding script."
      );
      console.log("   Run: node scripts/seed-fresh-food.js");
    } else {
      console.log("\n📋 Sample food listings:");
      foodListings.forEach((listing, index) => {
        console.log(
          `  ${index + 1}. ${listing.food_name} - ${
            listing.status
          } - Expires: ${listing.expiry_date}`
        );
      });
    }

    // Test 3: Check table structure
    console.log("\n3. Checking table structure...");
    const { data: tableInfo, error: tableError } = await supabase
      .from("food_listings")
      .select("*")
      .limit(1);

    if (!tableError && tableInfo && tableInfo.length > 0) {
      const sample = tableInfo[0];
      console.log("✅ Table structure looks good");
      console.log("📋 Available fields:", Object.keys(sample).join(", "));
    }

    // Test 4: Check for expired vs available items
    console.log("\n4. Checking item status distribution...");
    const { data: statusCounts, error: statusError } = await supabase
      .from("food_listings")
      .select("status");

    if (!statusError && statusCounts) {
      const statusDistribution = statusCounts.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      console.log("📊 Status distribution:", statusDistribution);
    }

    console.log("\n🎉 Database test completed!");

    if (foodListings.length === 0) {
      console.log("\n🚀 Next steps:");
      console.log("   1. Make sure your database is set up correctly");
      console.log("   2. Run: node scripts/seed-fresh-food.js");
      console.log("   3. Check the volunteer dashboard again");
    }
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
  }
}

// Run the test
testDatabase();
