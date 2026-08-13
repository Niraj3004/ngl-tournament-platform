import mongoose, { Schema, Document } from 'mongoose';

export interface IDeposit extends Document {
  uid: string; // Player UID
  amount: number;
  receiptUrl: string; // The URL of the uploaded QR code/receipt screenshot
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  processedBy?: string; // Admin UID who approved/rejected
  transactionId?: string; // Optional ID provided by the payment app (e.g. eSewa/Khalti ref number)
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema = new Schema<IDeposit>(
  {
    uid: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 10 }, // Minimum 10 rs deposit
    receiptUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String },
    processedBy: { type: String },
    transactionId: { type: String },
  },
  { timestamps: true }
);

export const Deposit = mongoose.model<IDeposit>('Deposit', DepositSchema);
