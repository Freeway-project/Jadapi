import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@jadapi/types';

interface UserDocument extends Omit<UserType, 'id'>, Document {
  _id: string;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Transform the output to match our UserType
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    (ret as any).id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  }
});

export const User = mongoose.model<UserDocument>('User', userSchema);