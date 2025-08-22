import { NextResponse } from "next/server";
import { postSurplusForEvent } from "@/lib/database";
import { notifyUsersWithinRadiusForEvent } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const created = await postSurplusForEvent(id, body, {
      prefillExpiry: true,
    });
    // Fire-and-forget async email notifications; don't block the response
    // Deliberately not awaited
    notifyUsersWithinRadiusForEvent(id, created.id, 5).catch((e) =>
      console.error("notifyUsersWithinRadiusForEvent failed", e)
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create listing for event:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create listing" },
      { status: 400 }
    );
  }
}
