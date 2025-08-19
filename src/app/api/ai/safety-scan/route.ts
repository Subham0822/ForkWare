import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Runtime: Node.js (we need to fetch images and base64-encode)
export const runtime = "nodejs";

type SafetyScanResponse = {
  spoilageRiskScore: number; // 0-100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  reasons: string[];
  recommendedAction: string;
  safeByHours?: number;
  suspiciousSigns?: string[];
};

function getApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY
  );
}

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mimeType };
}

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
      imageUrl,
      temperature,
      preparationMethod,
      quantity,
      expiryDate,
      foodName,
    }: {
      imageUrl: string;
      temperature?: string;
      preparationMethod?: string;
      quantity?: string;
      expiryDate?: string;
      foodName?: string;
    } = body || {};

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a certified food safety auditor. Given a food image and context, assess spoilage risk.
Return ONLY strict JSON with keys: spoilageRiskScore (0-100), riskLevel (Low|Medium|High|Critical), reasons (array of short strings), recommendedAction (string), safeByHours (number, optional), suspiciousSigns (array, optional).
Consider: appearance, moisture, discoloration, visible mold, dryness, oil separation, texture; plus temperature, preparation method, time until expiry.
Be conservative if uncertain.`;

    const generationConfig = {
      temperature: 0.2,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 512,
    };

    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      } as any,
      {
        text: `CONTEXT:\n- Food: ${foodName ?? "Unknown"}\n- Quantity: ${quantity ?? "Unknown"}\n- Temperature(°C): ${temperature ?? "Unknown"}\n- Preparation: ${preparationMethod ?? "Unknown"}\n- Expiry: ${expiryDate ?? "Unknown"}`,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Model returned non-JSON response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as SafetyScanResponse;

    // Basic validation & normalization
    const normalized: SafetyScanResponse = {
      spoilageRiskScore: Math.max(0, Math.min(100, Number(parsed.spoilageRiskScore) || 0)),
      riskLevel: (parsed.riskLevel as any) || "Low",
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 6) : [],
      recommendedAction: parsed.recommendedAction || "No action provided",
      safeByHours: typeof parsed.safeByHours === "number" ? parsed.safeByHours : undefined,
      suspiciousSigns: Array.isArray(parsed.suspiciousSigns) ? parsed.suspiciousSigns.slice(0, 6) : undefined,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (error: any) {
    console.error("AI Safety Scan error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to run AI safety scan" },
      { status: 500 }
    );
  }
}


