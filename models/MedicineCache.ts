import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicineCache extends Document {
  query: string;
  normalizedName?: string;
  genericName?: string;
  rxcui?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rxnormData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dailymedData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openfdaData?: any;
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineCacheSchema = new Schema<IMedicineCache>(
  {
    query: { type: String, required: true, unique: true, index: true }, // The original search query
    normalizedName: { type: String },
    genericName: { type: String },
    rxcui: { type: String, index: true },
    rxnormData: { type: Schema.Types.Mixed },
    dailymedData: { type: Schema.Types.Mixed },
    openfdaData: { type: Schema.Types.Mixed },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Expire cache after 30 days
MedicineCacheSchema.index({ lastFetchedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const MedicineCache: Model<IMedicineCache> =
  mongoose.models.MedicineCache || mongoose.model<IMedicineCache>("MedicineCache", MedicineCacheSchema);

export default MedicineCache;
