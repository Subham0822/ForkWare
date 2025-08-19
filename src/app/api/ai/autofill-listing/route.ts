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

type AutofillResponse = {
  description: string;
  suggestedTitle?: string;
  tags?: string[];
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
      quantity,
      preparationMethod,
      allergens,
      temperature,
      storageConditions,
    }: {
      foodName: string;
      quantity?: string;
      preparationMethod?: string;
      allergens?: string[];
      temperature?: string;
      storageConditions?: string;
    } = body || {};

    if (!foodName) {
      return NextResponse.json({ error: "foodName is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a concise, friendly listing description for surplus food to attract NGOs/students while emphasizing safety and freshness.
Return ONLY JSON with keys: description (<= 60 words), suggestedTitle (<= 8 words), tags (3-6 concise lowercase tags).
Details:\n- Food: ${foodName}\n- Quantity: ${quantity ?? "Unknown"}\n- Preparation: ${preparationMethod ?? "Unknown"}\n- Allergens: ${(allergens && allergens.join(", ")) || "Unknown"}\n- Temperature(°C): ${temperature ?? "Unknown"}\n- Storage: ${storageConditions ?? "Unknown"}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model returned non-JSON response");
    const data = JSON.parse(jsonMatch[0]) as AutofillResponse;

    const payload: AutofillResponse = {
      description: data.description || "",
      suggestedTitle: data.suggestedTitle,
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 6) : undefined,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error("AI Autofill error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate description" },
      { status: 500 }
    );
  }
}


