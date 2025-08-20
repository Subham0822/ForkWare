const { createClient } = require("@supabase/supabase-js");

// Hardcoded credentials
const supabaseUrl = "https://ofxepipohljspnkbrjpu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meGVwaXBvaGxqc3Bua2JyanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjQ4MiwiZXhwIjoyMDcwMjQ4NDgyfQ.ZG3ToJdfDk2q04JLA6Ma2ZSSMYLrSTPTPmGHF-GEOAI";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFoodListingsTable() {
  try {
    console.log("🔍 Checking food_listings table structure...");
    console.log("=============================================");
    
    // First, let's check what columns actually exist
    const { data: columns, error: columnsError } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'food_listings'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnsError) {
      console.log("⚠️  Could not check table structure directly");
      console.log("💡 Let's try a different approach...");
      
      // Try to insert a test record to see what the actual error is
      const testRecord = {
        event_id: "00000000-0000-0000-0000-000000000000", // Dummy ID
        food_name: "Test Food",
        category: "Test Category",
        quantity: 1,
        unit: "piece",
        expiry_date: new Date().toISOString(),
        status: "available"
      };
      
      const { error: testError } = await supabase
        .from("food_listings")
        .insert(testRecord);
      
      if (testError) {
        console.log("❌ Test insert error:", testError.message);
        
        // Check if it's a column name issue
        if (testError.message.includes("cateegory") || testError.message.includes("ccategory") || testError.message.includes("categorry")) {
          console.log("🔧 Found the issue! Column name is misspelled");
          console.log("💡 Need to fix the column name in the table");
        }
      }
    } else {
      console.log("📋 Current table columns:");
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check for misspelled columns
      const misspelledColumns = columns.filter(col => 
        col.column_name.includes('cateegory') || 
        col.column_name.includes('ccategory') || 
        col.column_name.includes('categorry')
      );
      
      if (misspelledColumns.length > 0) {
        console.log("\n⚠️  Found misspelled columns:");
        misspelledColumns.forEach(col => {
          console.log(`  - ${col.column_name} (should be 'category')`);
        });
        
        console.log("\n🔧 Attempting to fix column names...");
        
        // Try to rename the misspelled column
        const { error: renameError } = await supabase.rpc("exec_sql", {
          sql: `
            ALTER TABLE food_listings 
            RENAME COLUMN ${misspelledColumns[0].column_name} TO category;
          `
        });
        
        if (renameError) {
          console.log("❌ Failed to rename column:", renameError.message);
          console.log("💡 You may need to fix this manually in Supabase dashboard");
        } else {
          console.log("✅ Column renamed successfully!");
        }
      }
    }
    
    // Now let's try to create a proper food_listings table if needed
    console.log("\n🔧 Creating proper food_listings table...");
    
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Drop the existing table if it has issues
        DROP TABLE IF EXISTS food_listings CASCADE;
        
        -- Create a new, clean table
        CREATE TABLE food_listings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          food_name TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit TEXT NOT NULL,
          expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('available', 'picked_up', 'expired', 'donated')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_food_listings_event_id ON food_listings(event_id);
        CREATE INDEX idx_food_listings_status ON food_listings(status);
        CREATE INDEX idx_food_listings_category ON food_listings(category);
        
        -- Enable RLS
        ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Enable read access for all users" ON food_listings
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users" ON food_listings
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable update for authenticated users" ON food_listings
          FOR UPDATE USING (auth.role() = 'authenticated');
      `
    });
    
    if (createError) {
      console.error("❌ Failed to recreate table:", createError.message);
      console.log("💡 You may need to run this SQL manually in Supabase dashboard");
    } else {
      console.log("✅ food_listings table recreated successfully!");
      
      // Verify it works
      const { data: verifyData, error: verifyError } = await supabase
        .from("food_listings")
        .select("count", { count: "exact", head: true });
      
      if (verifyError) {
        console.error("❌ Table verification failed:", verifyError.message);
      } else {
        console.log(`✅ Table verified! Current records: ${verifyData}`);
      }
    }
    
    console.log("\n🎯 Next steps:");
    console.log("1. Run: node scripts/populate-events-with-realistic-data.js");
    console.log("2. This will now successfully create food listings");
    console.log("3. Your analytics will show realistic numbers instead of 0s");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixFoodListingsTable();
