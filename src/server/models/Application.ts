import mongoose, { Schema, Document, Types } from 'mongoose';

export type ApplicationStage =
  | 'Applied'
  | 'Resume Screened'
  | 'Online Assessment'
  | 'Technical Interview'
  | 'HR Round'
  | 'Offered'
  | 'Rejected';

export interface IApplicationHistoryItem {
  stage: ApplicationStage;
  timestamp: string;
  note?: string;
}

export interface IApplication extends Document {
  student: Types.ObjectId;
  job: Types.ObjectId;
  studentName: string;
  studentRollNumber: string;
  studentBranch: string;
  studentCgpa: number;
  studentBacklogs: number;
  resumeUrl: string;
  resumeFileName: string;
  applicationDate: string;
  currentStatus: ApplicationStage;
  statusHistory: IApplicationHistoryItem[];
  recruiterRemarks?: string;
  interviewSchedule?: {
    interviewId?: Types.ObjectId;
    date: string;
    time: string;
    mode: 'In-Person (Campus Lab 4)' | 'Virtual (Google Meet)' | 'Auditorium';
    linkOrVenue: string;
    instructions?: string;
  };
  offerLetter?: {
    ctcLpa: number;
    role: string;
    baseSalaryLpa: number;
    joiningDate: string;
    validTill: string;
    issuedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const ApplicationSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentRollNumber: {
      type: String,
      required: true,
    },
    studentBranch: {
      type: String,
      required: true,
    },
    studentCgpa: {
      type: Number,
      required: true,
    },
    studentBacklogs: {
      type: Number,
      default: 0,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    resumeFileName: {
      type: String,
      default: 'Student_Resume.pdf',
    },
    applicationDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    currentStatus: {
      type: String,
      enum: [
        'Applied',
        'Resume Screened',
        'Online Assessment',
        'Technical Interview',
        'HR Round',
        'Offered',
        'Rejected',
      ],
      default: 'Applied',
    },
    statusHistory: [
      {
        stage: { type: String, required: true },
        timestamp: { type: String, default: () => new Date().toLocaleString() },
        note: { type: String, default: '' },
      },
    ],
    recruiterRemarks: {
      type: String,
      default: '',
    },
    interviewSchedule: {
      interviewId: { type: Schema.Types.ObjectId, ref: 'Interview' },
      date: { type: String },
      time: { type: String },
      mode: {
        type: String,
        enum: ['In-Person (Campus Lab 4)', 'Virtual (Google Meet)', 'Auditorium'],
        default: 'Virtual (Google Meet)',
      },
      linkOrVenue: { type: String },
      instructions: { type: String },
    },
    offerLetter: {
      ctcLpa: { type: Number },
      role: { type: String },
      baseSalaryLpa: { type: Number },
      joiningDate: { type: String },
      validTill: { type: String },
      issuedAt: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications using compound unique index
ApplicationSchema.index({ student: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ job: 1, currentStatus: 1 });
ApplicationSchema.index({ student: 1, currentStatus: 1 });

export const ApplicationModel =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
