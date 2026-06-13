import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPrescriptionFile {
  url: string;
  publicId: string;
  type: "image" | "pdf";
  size: number;
}

export interface IPrescriptionOCR {
  provider: "gemini" | "groq" | "ocrspace" | "trocr" | "manual";
  rawText?: string;
  cleanedText?: string;
  confidence: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface IExtractedData {
  patientName?: string;
  doctorName?: string;
  prescriptionDate?: string;
  diagnosis?: string;
  notes?: string;
  followUpDate?: string;
}

export interface IPrescriptionRisk {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  summary?: string;
}

export interface IPrescription extends Document {
  patientId?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  file: IPrescriptionFile;
  ocr: IPrescriptionOCR;
  extractedData: IExtractedData;
  risk: IPrescriptionRisk;
  status: "uploaded" | "processing" | "pending_review" | "approved" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      type: { type: String, enum: ["image", "pdf"], required: true },
      size: { type: Number, required: true },
    },

    ocr: {
      provider: {
        type: String,
        enum: ["gemini", "groq", "ocrspace", "trocr", "manual"],
        default: "gemini",
      },
      rawText: { type: String },
      cleanedText: { type: String },
      confidence: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
    },

    extractedData: {
      patientName: { type: String },
      doctorName: { type: String },
      prescriptionDate: { type: String },
      diagnosis: { type: String },
      notes: { type: String },
      followUpDate: { type: String },
    },

    risk: {
      score: { type: Number, default: 0 },
      level: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low",
      },
      summary: { type: String },
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "pending_review", "approved", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ uploadedBy: 1 });
PrescriptionSchema.index({ status: 1 });

delete mongoose.models.Prescription;
const Prescription: Model<IPrescription> =
  mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", PrescriptionSchema);

export default Prescription;
