import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMedicineLog extends Document {
  scheduleId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: "taken" | "missed" | "skipped";
  takenAt: Date;
  note?: string;
  createdAt: Date;
}

const MedicineLogSchema = new Schema<IMedicineLog>(
  {
    scheduleId: { type: Schema.Types.ObjectId, ref: "MedicineSchedule", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["taken", "missed", "skipped"],
      required: true,
    },
    takenAt: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const MedicineLog: Model<IMedicineLog> =
  mongoose.models.MedicineLog || mongoose.model<IMedicineLog>("MedicineLog", MedicineLogSchema);

export default MedicineLog;
