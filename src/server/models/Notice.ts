import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotice extends Document {
  title: string;
  category: 'Drive Announcement' | 'Shortlist Result' | 'TPO Guideline' | 'Preparation';
  priority: 'High' | 'Normal';
  publishedDate: string;
  author: string;
  content: string;
  targetBranches: string[];
  attachmentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const NoticeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Drive Announcement', 'Shortlist Result', 'TPO Guideline', 'Preparation'],
      default: 'Drive Announcement',
    },
    priority: {
      type: String,
      enum: ['High', 'Normal'],
      default: 'Normal',
    },
    publishedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    author: {
      type: String,
      default: 'Prof. Dr. K. Ramanathan (TPO Dean)',
    },
    content: {
      type: String,
      required: true,
    },
    targetBranches: {
      type: [String],
      default: ['All Branches'],
    },
    attachmentName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

NoticeSchema.index({ createdAt: -1 });

export const NoticeModel =
  mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
