import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchParticipant extends Document {
  matchId: mongoose.Types.ObjectId;
  uid: string;
  gameId: string;
  entryFeePaid: number;
  status: 'joined' | 'disqualified' | 'refunded';
  joinedAt: Date;
  kills?: number;
  placement?: number;
  points?: number;
  prizeWon?: number;
}

const MatchParticipantSchema = new Schema<IMatchParticipant>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    uid: { type: String, required: true }, // References User.uid
    gameId: { type: String, required: true },
    entryFeePaid: { type: Number, required: true },
    status: { type: String, enum: ['joined', 'disqualified', 'refunded'], default: 'joined' },
    joinedAt: { type: Date, default: Date.now },
    kills: { type: Number, default: 0 },
    placement: { type: Number },
    points: { type: Number, default: 0 },
    prizeWon: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure a user can only join a specific match once
MatchParticipantSchema.index({ matchId: 1, uid: 1 }, { unique: true });

export const MatchParticipant = mongoose.model<IMatchParticipant>('MatchParticipant', MatchParticipantSchema);
