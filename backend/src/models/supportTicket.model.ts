import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  uid: string;
  category: string;
  subject: string;
  description: string;
  attachments: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: {
    senderId: string;
    message: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    uid: { type: String, required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    messages: [
      {
        senderId: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
