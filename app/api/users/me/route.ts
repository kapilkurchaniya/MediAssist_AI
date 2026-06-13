import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import { ROLES } from "@/constants/roles";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile = null;

    if (user.role === ROLES.PATIENT) {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
