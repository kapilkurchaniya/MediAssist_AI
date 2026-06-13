import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IApiLog extends Document {
  userId?: Types.ObjectId;
  provider: "gemini" | "ocrspace" | "huggingface" | "rxnorm" | "rxnav" | "dailymed" | "openfda";
  endpoint: string;
  status: "success" | "failed";
  latencyMs: number;
  errorMessage?: string;
  createdAt: Date;
}

const ApiLogSchema = new Schema<IApiLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    provider: {
      type: String,
      enum: ["gemini", "ocrspace", "huggingface", "rxnorm", "rxnav", "dailymed", "openfda"],
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    latencyMs: { type: Number, required: true },
    errorMessage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ApiLog: Model<IApiLog> = mongoose.models.ApiLog || mongoose.model<IApiLog>("ApiLog", ApiLogSchema);

export default ApiLog;
