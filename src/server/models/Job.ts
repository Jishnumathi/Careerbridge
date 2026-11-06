import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJob extends Document {
  recruiter: Types.ObjectId;
  companyName: string;
  companyLogo: string;
  companyWebsite: string;
  jobTitle: string;
  jobType: 'Full-time' | 'Internship + PPO' | 'Summer Internship';
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  salaryRange: number; // in LPA
  stipendPerMonth?: number;
  category: 'Standard' | 'Dream' | 'Super Dream';
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  minCgpa: number;
  eligibleBranches: string[];
  maxBacklogs: number;
  maxHistoryBacklogs: number;
  minTenthPercentage: number;
  minTwelfthPercentage: number;
  applicationDeadline: string;
  driveDate: string;
  selectionRounds: string[];
  jobStatus: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema: Schema = new Schema(
  {
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    companyWebsite: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship + PPO', 'Summer Internship'],
      default: 'Full-time',
    },
    location: {
      type: String,
      default: 'Bengaluru / Hyderabad',
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'Hybrid',
    },
    salaryRange: {
      type: Number,
      required: [true, 'Salary / CTC in LPA is required'],
      min: 0,
    },
    stipendPerMonth: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Standard', 'Dream', 'Super Dream'],
      default: 'Standard',
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    minCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 6.0,
    },
    eligibleBranches: {
      type: [String],
      default: ['All Branches'],
    },
    maxBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxHistoryBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    minTenthPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    minTwelfthPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    applicationDeadline: {
      type: String,
      required: true,
    },
    driveDate: {
      type: String,
      required: true,
    },
    selectionRounds: {
      type: [String],
      default: ['Online Assessment', 'Technical Interview 1', 'HR Round'],
    },
    jobStatus: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ jobStatus: 1, salaryRange: -1 });
JobSchema.index({ minCgpa: 1 });

export const JobModel = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
