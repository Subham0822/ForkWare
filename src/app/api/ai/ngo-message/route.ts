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

type MessageResponse = {
  subject: string;
  message: string; // short email/notification text
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
      eventName,
      venue,
      foodName,
      quantity,
      expiry,
    }: {
      eventName?: string;
      venue?: string;
      foodName?: string;
      quantity?: string;
      expiry?: string;
    } = body || {};

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Draft a short, action-oriented notification for verified NGOs about surplus food availability.
Return ONLY JSON with keys: subject (<= 10 words), message (<= 80 words).
Context: Event: ${eventName ?? "N/A"}, Venue: ${venue ?? "N/A"}, Food: ${foodName ?? "Surplus food"}, Quantity: ${quantity ?? "Unknown"}, Expires: ${expiry ?? "Unknown"}.
Emphasize pickup time window and fairness; avoid spammy tone.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 200 },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model returned non-JSON response");
    const data = JSON.parse(jsonMatch[0]) as MessageResponse;

    const payload: MessageResponse = {
      subject: data.subject || "Surplus food available",
      message: data.message || "Surplus food available for pickup.",
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    console.error("AI NGO Message error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate message" },
      { status: 500 }
    );
  }
}


