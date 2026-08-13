import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminAuditLog extends Document {
  actorUid: string; // The admin who performed the action
  action: string;
  entityId?: string; // ID of the affected resource (User, Match, Config, etc.)
  entityType?: string;
  details: Record<string, any>;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actorUid: { type: String, required: true },
    action: { type: String, required: true },
    entityId: { type: String },
    entityType: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
