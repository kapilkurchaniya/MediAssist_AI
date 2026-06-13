import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Prescription from "@/models/Prescription";
import PrescriptionMedicine from "@/models/PrescriptionMedicine";
import MedicineSchedule from "@/models/MedicineSchedule";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { analyzePrescriptionImage } from "@/lib/ai-prescription";
import { ROLES } from "@/constants/roles";

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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Convert File to Buffer and Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 2. Upload to Cloudinary (in parallel with Gemini for speed, or sequentially if you prefer. Sequential here for safety).
    const cloudinaryResult = await uploadImageToCloudinary(buffer);
    const imageUrl = cloudinaryResult.url;

    // 3. Extract data via Gemini OCR
    const extractedData = await analyzePrescriptionImage(base64Image, file.type);

    // 4. Create Prescription Record
    const prescription = await Prescription.create({
      patientId: user._id,
      uploadedBy: user._id,
      file: {
        url: imageUrl,
        publicId: cloudinaryResult.publicId,
        type: "image",
        size: file.size,
      },
      status: "uploaded",
      extractedData: {
        prescriptionDate: extractedData.patient_details?.date || undefined,
        patientName: extractedData.patient_details?.name || undefined,
      },
      ocr: {
        provider: extractedData.provider || "manual",
        rawText: JSON.stringify(extractedData),
        confidence: 95,
        status: "completed"
      },
      risk: {
        score: 0,
        level: "low",
        summary: "",
      }
    });

    // 5. Create Medicine Schedules based on explicitly extracted time slots
    const schedulePromises: Promise<any>[] = [];
    const slots = ['morning', 'afternoon', 'evening', 'bedtime'] as const;

    for (const slot of slots) {
      const slotMeds = extractedData.medication_schedule[slot];
      for (const med of slotMeds) {
        // Create PrescriptionMedicine
        const pm = await PrescriptionMedicine.create({
          prescriptionId: prescription._id,
          rawText: JSON.stringify(med),
          medicineName: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          duration: med.duration_days ? `${med.duration_days} days` : undefined,
          confidence: 95,
          beforeAfterFood: "not_specified",
          matchStatus: "unknown"
        });

        // Map 'bedtime' to 'night' to match existing Mongoose enum
        const timeOfDay = slot === 'bedtime' ? 'night' : slot;

        const schedulePromise = MedicineSchedule.create({
          patientId: user._id,
          prescriptionId: prescription._id,
          medicineId: pm._id,
          medicineName: med.name,
          dose: med.dosage,
          instruction: med.instructions,
          timeOfDay: timeOfDay,
          startDate: new Date(),
          status: "active",
        });

        schedulePromises.push(schedulePromise);
      }
    }

    await Promise.all(schedulePromises);

    return NextResponse.json({ 
      success: true, 
      prescriptionId: prescription._id,
      extractedData,
      imageUrl,
      provider: extractedData.provider,
    });

  } catch (error: any) {
    console.error("Prescription Upload Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
