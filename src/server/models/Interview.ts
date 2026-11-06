import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInterview extends Document {
  application: Types.ObjectId;
  student: Types.ObjectId;
  job: Types.ObjectId;
  recruiter: Types.ObjectId;
  interviewRound: string;
  interviewDate: string;
  interviewTime: string;
  mode: 'In-Person (Campus Lab 4)' | 'Virtual (Google Meet)' | 'Auditorium';
  venueOrMeetingLink: string;
  instructions?: string;
  interviewResult: 'Scheduled' | 'Cleared' | 'Failed' | 'Rescheduled';
  evaluatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const InterviewSchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
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
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewRound: {
      type: String,
      required: true,
      default: 'Technical Interview 1',
    },
    interviewDate: {
      type: String,
      required: true,
    },
    interviewTime: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['In-Person (Campus Lab 4)', 'Virtual (Google Meet)', 'Auditorium'],
      default: 'Virtual (Google Meet)',
    },
    venueOrMeetingLink: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      default: 'Please be ready 15 minutes prior with webcam and quiet environment.',
    },
    interviewResult: {
      type: String,
      enum: ['Scheduled', 'Cleared', 'Failed', 'Rescheduled'],
      default: 'Scheduled',
    },
    evaluatorNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

InterviewSchema.index({ student: 1, interviewDate: 1 });
InterviewSchema.index({ recruiter: 1, interviewDate: 1 });

export const InterviewModel =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);
