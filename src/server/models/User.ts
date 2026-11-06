import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'student' | 'recruiter' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
  organization?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: 'Apex Institute of Technology',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
