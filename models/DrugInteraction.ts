import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDrugInteraction extends Document {
  prescriptionId: Types.ObjectId;
  medicineA: string;
  medicineB: string;
  rxcuiA?: string;
  rxcuiB?: string;
  severity: "low" | "moderate" | "high" | "unknown";
  description: string;
  source: string;
  createdAt: Date;
}

const DrugInteractionSchema = new Schema<IDrugInteraction>(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
      index: true,
    },
    medicineA: { type: String, required: true },
    medicineB: { type: String, required: true },
    rxcuiA: { type: String },
    rxcuiB: { type: String },
    severity: {
      type: String,
      enum: ["low", "moderate", "high", "unknown"],
      default: "unknown",
    },
    description: { type: String, required: true },
    source: { type: String, default: "RxNav" },
  },
  { timestamps: true }
);

const DrugInteraction: Model<IDrugInteraction> =
  mongoose.models.DrugInteraction ||
  mongoose.model<IDrugInteraction>("DrugInteraction", DrugInteractionSchema);

export default DrugInteraction;
