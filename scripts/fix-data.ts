import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

import connectDB from "../lib/db";
import User from "../models/User";
import Prescription from "../models/Prescription";
import PrescriptionMedicine from "../models/PrescriptionMedicine";
import MedicineSchedule from "../models/MedicineSchedule";

const morningMeds = [
  { name: "Pan 40", dose: "40mg", instruction: "Take 1 tablet before breakfast (10 days)" },
  { name: "Swich-O-200", dose: "200mg", instruction: "Take 1 tablet (4 days)" },
  { name: "P500", dose: "500mg", instruction: "Take 1 tablet (4 days)" },
  { name: "A to Z", dose: "Standard", instruction: "Take 1 tablet once a day, continue for 20 days" }
];

const eveningMeds = [
  { name: "Swich-O-200", dose: "200mg", instruction: "Take 1 tablet (4 days)" },
  { name: "P500", dose: "500mg", instruction: "Take 1 tablet (4 days)" },
  { name: "Allegra-M", dose: "Standard", instruction: "Take 1 tablet at bedtime (4 days)" }
];

async function fixData() {
  await connectDB();
  console.log("Connected to DB");

  const user = await User.findOne({ role: "patient" });
  if (!user) {
    console.log("No patient found");
    process.exit(1);
  }

  const prescription = await Prescription.findOne({ patientId: user._id });
  if (!prescription) {
    console.log("No prescription found");
    process.exit(1);
  }

  // Clear existing
  await PrescriptionMedicine.deleteMany({ prescriptionId: prescription._id });
  await MedicineSchedule.deleteMany({ prescriptionId: prescription._id });
  console.log("Cleared existing records.");

  // Insert Morning
  for (const med of morningMeds) {
    const pm = await PrescriptionMedicine.create({
      prescriptionId: prescription._id,
      rawText: JSON.stringify(med),
      medicineName: med.name,
      dosage: med.dose,
      instructions: med.instruction,
      confidence: 100
    });

    await MedicineSchedule.create({
      patientId: user._id,
      prescriptionId: prescription._id,
      medicineId: pm._id,
      medicineName: med.name,
      dose: med.dose,
      instruction: med.instruction,
      timeOfDay: "morning",
      startDate: new Date(),
      status: "active",
    });
  }

  // Insert Evening
  for (const med of eveningMeds) {
    const pm = await PrescriptionMedicine.create({
      prescriptionId: prescription._id,
      rawText: JSON.stringify(med),
      medicineName: med.name,
      dosage: med.dose,
      instructions: med.instruction,
      confidence: 100
    });

    await MedicineSchedule.create({
      patientId: user._id,
      prescriptionId: prescription._id,
      medicineId: pm._id,
      medicineName: med.name,
      dose: med.dose,
      instruction: med.instruction,
      timeOfDay: "evening",
      startDate: new Date(),
      status: "active",
    });
  }

  console.log("Data successfully fixed.");
  process.exit(0);
}

fixData();
