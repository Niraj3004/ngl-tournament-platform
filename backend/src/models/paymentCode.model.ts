import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentCode extends Document {
  code: string;
  amount: number;
  status: 'active' | 'redeemed' | 'deactivated';
  isRedeemed: boolean;
  expiresAt: Date;
  createdBy: string; // Admin UID
  redeemedBy?: string; // Player UID
  redeemedAt?: Date;
}

const PaymentCodeSchema = new Schema<IPaymentCode>(
  {
    code: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'redeemed', 'deactivated'], default: 'active' },
    isRedeemed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdBy: { type: String, required: true },
    redeemedBy: { type: String },
    redeemedAt: { type: Date },
  },
  { timestamps: true }
);

export const PaymentCode = mongoose.model<IPaymentCode>('PaymentCode', PaymentCodeSchema);
