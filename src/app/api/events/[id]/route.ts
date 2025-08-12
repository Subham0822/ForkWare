import { NextResponse } from "next/server";
import {
  getEventWithListings,
  finalizeEvent,
  getEventSummary,
} from "@/lib/database";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await getEventWithListings(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    if (body?.action === "finalize") {
      await finalizeEvent(id, { expireUnclaimed: true, markCompleted: true });
      const summary = await getEventSummary(id);
      return NextResponse.json({ status: "finalized", summary });
    }
    return NextResponse.json(
      { message: "Unsupported action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 400 }
    );
  }
}
