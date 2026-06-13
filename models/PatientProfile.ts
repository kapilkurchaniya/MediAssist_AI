import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface IPatientProfile extends Document {
  userId: Types.ObjectId;
  age?: number;
  gender?: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact?: IEmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number },
    gender: { type: String },
    allergies: [{ type: String }],
    medicalConditions: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
  },
  { timestamps: true }
);

const PatientProfile: Model<IPatientProfile> =
  mongoose.models.PatientProfile ||
  mongoose.model<IPatientProfile>("PatientProfile", PatientProfileSchema);

export default PatientProfile;
