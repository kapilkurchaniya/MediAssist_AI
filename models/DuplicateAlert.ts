import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDuplicateAlert extends Document {
  prescriptionId: Types.ObjectId;
  medicineA: string;
  medicineB: string;
  reason: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
}

const DuplicateAlertSchema = new Schema<IDuplicateAlert>(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
      index: true,
    },
    medicineA: { type: String, required: true },
    medicineB: { type: String, required: true },
    reason: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const DuplicateAlert: Model<IDuplicateAlert> =
  mongoose.models.DuplicateAlert ||
  mongoose.model<IDuplicateAlert>("DuplicateAlert", DuplicateAlertSchema);

export default DuplicateAlert;
