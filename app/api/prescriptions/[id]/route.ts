import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Prescription from "@/models/Prescription";
import PrescriptionMedicine from "@/models/PrescriptionMedicine";
import MedicineSchedule from "@/models/MedicineSchedule";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params per Next.js 15 routing conventions
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Ensure the user deleting it is the patient who owns it
    if (!prescription.patientId || prescription.patientId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden: You do not own this prescription." }, { status: 403 });
    }

    // Cascading Deletes
    await PrescriptionMedicine.deleteMany({ prescriptionId: id });
    await MedicineSchedule.deleteMany({ prescriptionId: id });
    await Prescription.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Prescription and all related records deleted." });
  } catch (error) {
    console.error("Prescription Deletion Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
