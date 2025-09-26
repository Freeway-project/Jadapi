import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@jadapi/types';

export interface UserDocument extends Omit<UserType, 'id'>, Document {
  _id: string;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    },
  },
});

export const User = mongoose.model<UserDocument>('User', userSchema);