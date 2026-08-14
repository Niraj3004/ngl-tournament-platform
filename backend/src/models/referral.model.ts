import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerId: string; // The user who shared their code
  referredId: string; // The user who registered with the code
  status: 'pending' | 'rewarded'; 
  rewardAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: String, required: true },
    referredId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'rewarded'], default: 'pending' },
    rewardAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
