import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICertification {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  year?: string;
}

export interface IStudent extends Document {
  user: Types.ObjectId;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  graduationYear: string;
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  activeBacklogs: number;
  historyBacklogs: number;
  skills: string[];
  projects: IProject[];
  certifications: ICertification[];
  resumeUrl: string;
  resumeFileName: string;
  resumeUpdatedAt: Date;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isVerifiedByTpo: boolean;
  tpoVerificationDate?: Date;
  placementStatus: 'Unplaced' | 'Placed' | 'Opted Out';
  placedDetails?: {
    company: string;
    ctcLpa: number;
    offerDate: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const StudentSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Registration / Roll Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department / Branch is required'],
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics & Comm',
        'Electrical & Electronics',
        'Mechanical Engg',
        'Civil Engg',
      ],
    },
    graduationYear: {
      type: String,
      default: '2026',
    },
    cgpa: {
      type: Number,
      required: true,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 0,
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    historyBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        technologies: { type: [String], default: [] },
        link: { type: String, default: '' },
        year: { type: String, default: '2026' },
      },
    ],
    certifications: [
      {
        id: { type: String, default: () => new Types.ObjectId().toString() },
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        year: { type: String, default: '2025' },
      },
    ],
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: '',
    },
    resumeUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    isVerifiedByTpo: {
      type: Boolean,
      default: false,
    },
    tpoVerificationDate: {
      type: Date,
    },
    placementStatus: {
      type: String,
      enum: ['Unplaced', 'Placed', 'Opted Out'],
      default: 'Unplaced',
    },
    placedDetails: {
      company: { type: String },
      ctcLpa: { type: Number },
      offerDate: { type: String },
      role: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.index({ rollNumber: 1 });
StudentSchema.index({ department: 1, cgpa: -1 });

export const StudentModel = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
