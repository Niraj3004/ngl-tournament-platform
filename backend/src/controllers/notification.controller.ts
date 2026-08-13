import { Response } from 'express';
import { Notification } from '../models/notification.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ uid: req.user!.uid })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationIds } = req.body; // Array of IDs, or empty to mark all
    
    let query: any = { uid: req.user!.uid, isRead: false };
    if (notificationIds && notificationIds.length > 0) {
      query._id = { $in: notificationIds };
    }

    await Notification.updateMany(query, { isRead: true });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
