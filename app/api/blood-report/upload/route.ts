import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import BloodReport from "@/models/BloodReport";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { analyzeBloodReport } from "@/lib/ai-blood-report";
import { ROLES } from "@/constants/roles";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== ROLES.PATIENT) {
      return NextResponse.json({ error: "Only patients can upload blood reports." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Upload to Cloudinary for storage
    let fileUrl = "";
    try {
      const cloudinaryResult = await uploadImageToCloudinary(buffer, "mediassist/blood-reports");
      fileUrl = cloudinaryResult.url;
    } catch {
      // If cloudinary fails for PDFs, store a placeholder
      fileUrl = "upload-failed";
    }

    // Analyze with AI
    const analysis = await analyzeBloodReport(base64Data, file.type);

    // Save to database
    const report = await BloodReport.create({
      patientId: user._id,
      fileUrl,
      fileName: file.name,
      biomarkers: analysis.biomarkers,
      summary: analysis.summary,
    });

    return NextResponse.json({
      success: true,
      report: {
        _id: report._id,
        biomarkers: report.biomarkers,
        summary: report.summary,
        fileName: report.fileName,
        createdAt: report.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Blood Report Upload Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
