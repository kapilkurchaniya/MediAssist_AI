import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clerkId, email, fullName, avatarUrl } = body;

    if (userId !== clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user
      user = await User.create({
        clerkId,
        email,
        fullName,
        avatarUrl,
        role: "patient", // default role
        onboardingCompleted: false,
      });
    } else {
      // Update existing user
      user.email = email;
      user.fullName = fullName;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
