import { NextResponse } from "next/server";
import {
  getAllEvents,
  registerEvent,
  type EventRegistrationInput,
} from "@/lib/database";

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EventRegistrationInput;
    const created = await registerEvent(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create event" },
      { status: 400 }
    );
  }
}
