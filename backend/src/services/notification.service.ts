import { Notification } from '../models/notification.model';

export const sendNotification = async (uid: string, message: string, type = 'system', relatedId?: string) => {
  return Notification.create({ uid, message, type, relatedId });
};
