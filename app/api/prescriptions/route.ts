import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Prescription from "@/models/Prescription";
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

    let prescriptions = [];

    if (user.role === ROLES.PATIENT) {
      prescriptions = await Prescription.find({ patientId: user._id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
       // Admin sees all
       prescriptions = await Prescription.find()
       .sort({ createdAt: -1 })
       .populate("patientId", "fullName")
       .limit(100)
       .lean();
    }

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("Prescriptions List API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
