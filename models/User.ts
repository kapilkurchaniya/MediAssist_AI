import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "patient" | "admin";
  avatarUrl?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },
    avatarUrl: { type: String },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
