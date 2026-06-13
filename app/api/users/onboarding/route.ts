import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PatientProfile from "@/models/PatientProfile";
import { ROLES } from "@/constants/roles";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || role !== ROLES.PATIENT) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found. Please sync first." }, { status: 404 });
    }

    // Update user role and mark onboarding complete
    user.role = role;
    user.onboardingCompleted = true;
    await user.save();

    const existingProfile = await PatientProfile.findOne({ userId: user._id });
    if (!existingProfile) {
      await PatientProfile.create({
        userId: user._id,
        allergies: [],
        medicalConditions: [],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
