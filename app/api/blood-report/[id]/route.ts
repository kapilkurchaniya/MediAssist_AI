import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import BloodReport from "@/models/BloodReport";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const report = await BloodReport.findById(id);

    if (!report) {
      return NextResponse.json({ error: "Blood report not found" }, { status: 404 });
    }

    if (!report.patientId || report.patientId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await BloodReport.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Blood report deleted." });
  } catch (error) {
    console.error("Blood Report Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
