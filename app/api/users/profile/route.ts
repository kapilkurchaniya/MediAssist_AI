import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import PatientProfile from "@/models/PatientProfile";
import { ROLES } from "@/constants/roles";

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === ROLES.DOCTOR) {
      const { specialization, clinicName, licenseNumber, address } = body;
      const updatedProfile = await DoctorProfile.findOneAndUpdate(
        { userId: user._id },
        { specialization, clinicName, licenseNumber, address },
        { new: true, runValidators: true }
      );
      return NextResponse.json({ success: true, profile: updatedProfile });
    } else if (user.role === ROLES.PATIENT) {
      const { age, gender, allergies, medicalConditions, emergencyContact } = body;
      const updatedProfile = await PatientProfile.findOneAndUpdate(
        { userId: user._id },
        { age, gender, allergies, medicalConditions, emergencyContact },
        { new: true, runValidators: true }
      );
      return NextResponse.json({ success: true, profile: updatedProfile });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
