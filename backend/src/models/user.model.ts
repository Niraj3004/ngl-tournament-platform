import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string; // Unique identifier (from Firebase initially, now just a UUID or MongoDB ObjectId string)
  email: string;
  password?: string;
  displayName?: string;
  dateOfBirth?: Date;
  gameId?: string;
  profilePhoto?: string;
  
  // Status / eligibility
  role: 'player' | 'admin';
  status: 'active' | 'blocked';
  blockReason?: string;
  referredBy?: string; // UID of the referrer
  eligibilityStatus: 'pending' | 'eligible' | 'ineligible';
  ageVerified: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    displayName: { type: String },
    dateOfBirth: { type: Date },
    gameId: { type: String },
    profilePhoto: { type: String },

    role: { type: String, enum: ['player', 'admin'], default: 'player' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    blockReason: { type: String },
    referredBy: { type: String },
    eligibilityStatus: { type: String, enum: ['pending', 'eligible', 'ineligible'], default: 'pending' },
    ageVerified: { type: Boolean, default: false },
    kycStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
