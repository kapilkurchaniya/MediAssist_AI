import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Prescription from "@/models/Prescription";
import MedicineSchedule from "@/models/MedicineSchedule";
import MedicineLog from "@/models/MedicineLog";
import { ROLES } from "@/constants/roles";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || user.role !== ROLES.PATIENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get active medicines count
    const activeMedicines = await MedicineSchedule.countDocuments({
      patientId: user._id,
      status: "active",
    });

    // Get total prescriptions
    const totalPrescriptions = await Prescription.countDocuments({ patientId: user._id });

    // Get upcoming schedules for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const upcomingSchedules = await MedicineSchedule.find({
      patientId: user._id,
      status: "active",
    })
      .populate("prescriptionId", "doctorName")
      .sort({ timeOfDay: 1 })
      .lean();

    // Fetch today's logs for this patient
    const todayLogs = await MedicineLog.find({
      patientId: user._id,
      takenAt: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // Attach taken status to schedules
    const upcomingSchedulesWithLogs = upcomingSchedules.map((schedule: any) => {
      const log = todayLogs.find((l: any) => l.scheduleId.toString() === schedule._id.toString());
      return {
        ...schedule,
        takenToday: log?.status === "taken",
      };
    });

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({ patientId: user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      metrics: {
        activeMedicines,
        totalPrescriptions,
      },
      upcomingSchedules: upcomingSchedulesWithLogs,
      recentPrescriptions,
    });
  } catch (error) {
    console.error("Patient Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
