import { NextResponse } from "next/server";
import { getSession } from "@/app/actions/auth-supabase";
import { updateUser } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const session: any = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { message: "latitude and longitude must be numbers" },
        { status: 400 }
      );
    }

    const updated = await updateUser(session.user.id, { latitude, longitude });
    return NextResponse.json({ ok: true, profile: updated });
  } catch (error: any) {
    console.error("Failed to update user location:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update location" },
      { status: 400 }
    );
  }
}


