import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import MedicineLog from "@/models/MedicineLog";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { scheduleId, status } = body;

    if (!scheduleId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine today's start and end date to check if a log already exists
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let log = await MedicineLog.findOne({
      scheduleId,
      patientId: user._id,
      takenAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (log) {
      // Update existing log
      log.status = status;
      log.takenAt = new Date();
      await log.save();
    } else {
      // Create new log
      log = await MedicineLog.create({
        scheduleId,
        patientId: user._id,
        status,
        takenAt: new Date()
      });
    }

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Medicine Log Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
