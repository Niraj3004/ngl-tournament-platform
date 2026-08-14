import { Response } from 'express';
import { AppConfig } from '../models/appConfig.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getConfig = async (req: AuthRequest, res: Response) => {
  try {
    let config = await AppConfig.findOne();
    if (!config) {
      config = await AppConfig.create({}); // Create default if none exists
    }
    res.status(200).json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await AppConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.status(200).json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
