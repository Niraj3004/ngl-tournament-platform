import mongoose, { Schema, Document } from 'mongoose';

export interface IAppConfig extends Document {
  realMoneyFeaturesEnabled: boolean;
  tournamentJoiningEnabled: boolean;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyWithdrawalLimit: number;
  referralBonus: number;
  signupBonus: number;
  maintenanceMode: boolean;
  supportLinks: {
    whatsapp?: string;
    discord?: string;
    email?: string;
  };
}

const AppConfigSchema = new Schema<IAppConfig>(
  {
    realMoneyFeaturesEnabled: { type: Boolean, default: false },
    tournamentJoiningEnabled: { type: Boolean, default: true },
    depositEnabled: { type: Boolean, default: true },
    withdrawalEnabled: { type: Boolean, default: true },
    minWithdrawal: { type: Number, default: 100 },
    maxWithdrawal: { type: Number, default: 10000 },
    dailyWithdrawalLimit: { type: Number, default: 50000 },
    referralBonus: { type: Number, default: 10 },
    signupBonus: { type: Number, default: 0 },
    maintenanceMode: { type: Boolean, default: false },
    supportLinks: {
      whatsapp: { type: String },
      discord: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

// We will only ever have one document in this collection
export const AppConfig = mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);
