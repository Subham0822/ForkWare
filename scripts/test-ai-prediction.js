const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error("❌ Missing Gemini API key");
  console.log("Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file");
  process.exit(1);
}

async function testGeminiAI() {
  try {
    console.log("🧪 Testing Gemini AI Integration...");
    console.log("================================");

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("✅ Gemini AI initialized successfully");

    // Test simple prompt
    const testPrompt = `
    You are an AI expert in food demand prediction. 
    Please provide a simple prediction for a corporate event with 100 attendees.
    
    Return ONLY valid JSON in this format:
    {
      "predictedSurplus": {
        "totalKg": 15.5,
        "confidence": 0.8,
        "breakdown": {
          "veg": 6.2,
          "nonVeg": 6.2,
          "desserts": 2.3,
          "beverages": 0.8
        }
      },
      "factors": {
        "historicalWaste": 0.15,
        "attendanceVariation": 0.1,
        "weatherImpact": 0.05,
        "eventTypeFactor": 0.1,
        "seasonalAdjustment": 0.05
      },
      "recommendations": [
        "Implement portion control",
        "Monitor attendance closely"
      ],
      "riskLevel": "medium"
    }
    `;

    console.log("🔄 Testing AI prediction generation...");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: testPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      },
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ AI response received");
    console.log("📝 Raw response:", text.substring(0, 200) + "...");

    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const predictionData = JSON.parse(jsonMatch[0]);
        console.log("✅ JSON parsed successfully");
        console.log(
          "📊 Prediction data:",
          JSON.stringify(predictionData, null, 2)
        );
      } else {
        console.log("⚠️  No JSON found in response");
      }
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError.message);
    }

    console.log("\n✨ Gemini AI test completed successfully!");
    console.log("💡 The AI integration should work in your app now");
  } catch (error) {
    console.error("❌ Gemini AI test failed:", error.message);

    if (error.message.includes("API_KEY_INVALID")) {
      console.log("💡 Check your Gemini API key in .env.local");
    } else if (error.message.includes("quota")) {
      console.log("💡 You may have hit your Gemini API quota limit");
    } else if (error.message.includes("network")) {
      console.log("💡 Check your internet connection");
    }
  }
}

// Run the test
if (require.main === module) {
  testGeminiAI()
    .then(() => {
      console.log("\n✨ Test completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testGeminiAI };
