import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  title: string;
  mode: string;
  map: string;
  entryFee: number;
  prizePool: number;
  prizeDistribution: Record<string, number>;
  minParticipants: number;
  maxParticipants: number;
  participantCount: number;
  
  status: 'open' | 'registration_closed' | 'room_revealed' | 'started' | 'completed' | 'cancelled' | 'refunded';
  
  registrationTime: Date;
  matchTime: Date;
  revealTime: Date;
  
  roomDetails?: {
    roomId: string;
    password?: string;
  };
  
  scoringType: string;
  rules: string[];
}

const MatchSchema = new Schema<IMatch>(
  {
    title: { type: String, required: true },
    mode: { type: String, required: true },
    map: { type: String, required: true },
    entryFee: { type: Number, required: true, default: 0 },
    prizePool: { type: Number, required: true, default: 0 },
    prizeDistribution: { type: Map, of: Number },
    minParticipants: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    participantCount: { type: Number, default: 0 },
    
    status: { 
      type: String, 
      enum: ['open', 'registration_closed', 'room_revealed', 'started', 'completed', 'cancelled', 'refunded'], 
      default: 'open' 
    },
    
    registrationTime: { type: Date, required: true },
    matchTime: { type: Date, required: true },
    revealTime: { type: Date, required: true },
    
    // Kept secret until revealTime, hidden in public queries
    roomDetails: {
      roomId: { type: String },
      password: { type: String },
    },
    
    scoringType: { type: String, required: true },
    rules: [{ type: String }],
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
