import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBiomarker {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "unknown";
  recommendation?: string;
}

export interface IBloodReport extends Document {
  patientId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  biomarkers: IBiomarker[];
  summary: {
    possibleMeanings: string;
    recommendations: string;
    whenToConsult: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const biomarkerSchema = new Schema<IBiomarker>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, default: "" },
  referenceRange: { type: String, default: "" },
  status: { type: String, enum: ["normal", "high", "low", "unknown"], default: "unknown" },
  recommendation: { type: String, default: "" },
});

const bloodReportSchema = new Schema<IBloodReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    biomarkers: [biomarkerSchema],
    summary: {
      possibleMeanings: { type: String, default: "" },
      recommendations: { type: String, default: "" },
      whenToConsult: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

delete mongoose.models.BloodReport;
const BloodReport: Model<IBloodReport> =
  mongoose.models.BloodReport || mongoose.model<IBloodReport>("BloodReport", bloodReportSchema);

export default BloodReport;
