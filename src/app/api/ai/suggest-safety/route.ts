import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function getApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY
  );
}

type SafetySuggestResponse = {
  safetyRating?: number; // 1-5
  allergens?: string[];
  storageConditions?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key. Set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      foodName,
      description,
      preparationMethod,
      temperature,
    }: {
      foodName: string;
      description?: string;
      preparationMethod?: string;
      temperature?: string;
    } = body || {};

    if (!foodName) {
      return NextResponse.json({ error: "foodName is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Suggest food safety metadata.
Return ONLY JSON with keys: safetyRating (1-5), allergens (array of common allergens if applicable), storageConditions (short guidance sentence), notes (optional).
Context:\n- Food: ${foodName}\n- Description: ${description ?? "N/A"}\n- Preparation: ${preparationMethod ?? "N/A"}\n- Temperature(°C): ${temperature ?? "N/A"}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model returned non-JSON response");
    const data = JSON.parse(jsonMatch[0]) as SafetySuggestResponse;

    const payload: SafetySuggestResponse = {
      safetyRating:
        typeof data.safetyRating === "number"
          ? Math.max(1, Math.min(5, Math.round(data.safetyRating)))
          : undefined,
      allergens: Array.isArray(data.allergens) ? data.allergens.slice(0, 10) : undefined,
      storageConditions: data.storageConditions,
      notes: data.notes,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error("AI Suggest Safety error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to suggest safety" },
      { status: 500 }
    );
  }
}


