import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  uid: string;
  type: 'deposit' | 'tournament_entry' | 'prize' | 'withdrawal' | 'refund' | 'referral_bonus' | 'signup_bonus' | 'admin_adjustment' | 'reversal';
  amount: number; // Positive for credits, negative for debits
  balanceAfter: number;
  referenceId?: string; // e.g. Match ID, Payment Code ID, Withdrawal ID
  description: string;
  idempotencyKey: string;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    uid: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['deposit', 'tournament_entry', 'prize', 'withdrawal', 'refund', 'referral_bonus', 'signup_bonus', 'admin_adjustment', 'reversal'],
      required: true 
    },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String },
    description: { type: String, required: true },
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
