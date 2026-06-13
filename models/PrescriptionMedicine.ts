import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPrescriptionMedicine extends Document {
  prescriptionId: Types.ObjectId;
  rawText: string;
  medicineName: string;
  normalizedName?: string;
  genericName?: string;
  rxcui?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  beforeAfterFood: "before_food" | "after_food" | "with_food" | "not_specified";
  confidence: number;
  matchStatus: "matched" | "possible_match" | "unknown";
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionMedicineSchema = new Schema<IPrescriptionMedicine>(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
      index: true,
    },
    rawText: { type: String, required: true },
    medicineName: { type: String, required: true },
    normalizedName: { type: String },
    genericName: { type: String },
    rxcui: { type: String },
    strength: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    instructions: { type: String },
    beforeAfterFood: {
      type: String,
      enum: ["before_food", "after_food", "with_food", "not_specified"],
      default: "not_specified",
    },
    confidence: { type: Number, default: 0 },
    matchStatus: {
      type: String,
      enum: ["matched", "possible_match", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

const PrescriptionMedicine: Model<IPrescriptionMedicine> =
  mongoose.models.PrescriptionMedicine ||
  mongoose.model<IPrescriptionMedicine>("PrescriptionMedicine", PrescriptionMedicineSchema);

export default PrescriptionMedicine;
