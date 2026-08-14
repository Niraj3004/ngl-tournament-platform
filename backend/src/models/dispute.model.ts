import mongoose, { Schema, Document } from 'mongoose';

export interface IDispute extends Document {
  matchId: mongoose.Types.ObjectId;
  uid: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'pending' | 'resolved' | 'rejected';
  resolutionMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    uid: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidenceUrls: [{ type: String }],
    status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
    resolutionMessage: { type: String }
  },
  { timestamps: true }
);

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
