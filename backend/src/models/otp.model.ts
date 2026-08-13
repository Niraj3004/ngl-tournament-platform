import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: 'verification' | 'reset';
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['verification', 'reset'], default: 'verification' },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Automatically deletes the document after 10 minutes (600 seconds)
});

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
