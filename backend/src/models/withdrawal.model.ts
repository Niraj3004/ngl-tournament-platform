import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  uid: string;
  amount: number;
  accountDetails: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'failed' | 'cancelled';
  rejectionReason?: string;
  processedBy?: string; // Admin UID
  processedAt?: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    uid: { type: String, required: true },
    amount: { type: Number, required: true },
    accountDetails: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'paid', 'rejected', 'failed', 'cancelled'], 
      default: 'pending' 
    },
    rejectionReason: { type: String },
    processedBy: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
