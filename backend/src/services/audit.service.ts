import { AdminAuditLog } from '../models/auditLog.model';
import mongoose from 'mongoose';

/**
 * Appends a record to the admin audit log. 
 * This should ideally be used inside a transaction if part of a larger operation.
 */
export const writeAuditLog = async (
  actorUid: string,
  action: string,
  details: Record<string, any>,
  entityId?: string,
  entityType?: string,
  session?: mongoose.ClientSession
) => {
  await AdminAuditLog.create(
    [
      {
        actorUid,
        action,
        details,
        entityId,
        entityType,
      },
    ],
    { session }
  );
};
