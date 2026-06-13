import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMedicineSchedule extends Document {
  prescriptionId: Types.ObjectId;
  medicineId: Types.ObjectId;
  patientId: Types.ObjectId;
  medicineName: string;
  dose: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night" | "custom";
  exactTime?: string;
  instruction?: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "stopped";
  createdAt: Date;
  updatedAt: Date;
}

const MedicineScheduleSchema = new Schema<IMedicineSchedule>(
  {
    prescriptionId: { type: Schema.Types.ObjectId, ref: "Prescription", required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: "PrescriptionMedicine", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineName: { type: String, required: true },
    dose: { type: String, default: "" },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night", "custom"],
      required: true,
    },
    exactTime: { type: String }, // Format: HH:mm
    instruction: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "completed", "stopped"],
      default: "active",
    },
  },
  { timestamps: true }
);

const MedicineSchedule: Model<IMedicineSchedule> =
  mongoose.models.MedicineSchedule ||
  mongoose.model<IMedicineSchedule>("MedicineSchedule", MedicineScheduleSchema);

export default MedicineSchedule;
