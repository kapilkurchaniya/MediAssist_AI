import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import MedicineSchedule from "@/models/MedicineSchedule";
import { generateAssistantResponse } from "@/lib/cohere";
import { generateSpeechFromText } from "@/lib/huggingface-tts";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, useTts, language = "en" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch patient's upcoming schedules for context
    const upcomingSchedules = await MedicineSchedule.find({
      patientId: user._id,
      status: "active",
    })
      .populate("prescriptionId", "doctorName")
      .sort({ timeOfDay: 1 })
      .lean();

    let context = "No active medicines scheduled.";
    if (upcomingSchedules.length > 0) {
      context = "Patient's active medicines:\n" + upcomingSchedules.map((s: any) => 
        `- ${s.medicineName} (${s.dose}) to be taken in the ${s.timeOfDay}.`
      ).join("\n");
    }

    // Call Cohere
    const aiResponseText = await generateAssistantResponse(prompt, context, language);
    let audioBase64 = null;

    if (useTts) {
      try {
        const audioBuffer = await generateSpeechFromText(aiResponseText, language);
        audioBase64 = Buffer.from(audioBuffer).toString("base64");
      } catch (err) {
        console.error("Failed to generate TTS audio", err);
      }
    }

    return NextResponse.json({
      text: aiResponseText,
      audio: audioBase64,
    });
  } catch (error) {
    console.error("Patient Assistant API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
