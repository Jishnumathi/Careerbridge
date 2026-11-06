import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
  | 'application_status'
  | 'interview_scheduled'
  | 'offer_extended'
  | 'job_posted'
  | 'profile_verified'
  | 'general_announcement';

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      enum: [
        'application_status',
        'interview_scheduled',
        'offer_extended',
        'job_posted',
        'profile_verified',
        'general_announcement',
      ],
      default: 'application_status',
    },
    relatedId: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
