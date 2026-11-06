import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecruiter extends Document {
  user: Types.ObjectId;
  companyName: string;
  designation: string;
  industry: string;
  website: string;
  companyLogo: string;
  isVerified: boolean;
  contactPhone?: string;
  officeLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RecruiterSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    designation: {
      type: String,
      default: 'Campus Talent Acquisition Lead',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Technology & Cloud Solutions',
    },
    website: {
      type: String,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    officeLocation: {
      type: String,
      default: 'Bengaluru / Hyderabad',
    },
  },
  {
    timestamps: true,
  }
);

RecruiterSchema.index({ companyName: 1 });

export const RecruiterModel =
  mongoose.models.Recruiter || mongoose.model<IRecruiter>('Recruiter', RecruiterSchema);
