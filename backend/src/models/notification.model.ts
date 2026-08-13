import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  uid: string;
  message: string;
  isRead: boolean;
  type: string; // 'system', 'tournament', 'wallet'
  relatedId?: string; // e.g. matchId or transactionId
}

const NotificationSchema = new Schema<INotification>(
  {
    uid: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, default: 'system' },
    relatedId: { type: String }
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
