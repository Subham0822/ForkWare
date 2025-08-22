import { NextResponse } from "next/server";
import { updateEvent } from "@/lib/database";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { message: "latitude and longitude must be numbers" },
        { status: 400 }
      );
    }

    const updated = await updateEvent(id, { latitude, longitude });
    return NextResponse.json({ ok: true, event: updated });
  } catch (error: any) {
    console.error("Failed to update event location:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update event location" },
      { status: 400 }
    );
  }
}


