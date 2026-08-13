import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  uid: string; // References User.uid
  availableBalance: number;
  lockedBalance: number;
}

const WalletSchema = new Schema<IWallet>(
  {
    uid: { type: String, required: true, unique: true },
    availableBalance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
