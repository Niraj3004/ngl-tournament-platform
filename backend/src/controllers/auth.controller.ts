import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { env } from '../config/env';
import crypto from 'crypto';

// In-memory store for OTPs
const otpStore = new Map<string, string>();

export const sendOtp = async (req: Request, res: Response) => {
  const { phone, countryCode = '+977' } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(`${countryCode}${phone}`, otp);

  console.log(`[MOCK SMS] OTP for ${countryCode}${phone} is ${otp}`);
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, countryCode = '+977', otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  const fullPhone = `${countryCode}${phone}`;
  const storedOtp = otpStore.get(fullPhone);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    otpStore.delete(fullPhone);

    let user = await User.findOne({ phone, countryCode });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const uid = crypto.randomUUID(); 

      user = await User.create({
        uid, phone, countryCode, role: 'player', status: 'active', eligibilityStatus: 'pending',
      });

      await Wallet.create({ uid, availableBalance: 0, lockedBalance: 0 });
    } else if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    const token = jwt.sign({ uid: user.uid, role: user.role }, env.jwtSecret, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      isNewUser,
      token,
      user: {
        uid: user.uid, phone: user.phone, role: user.role, displayName: user.displayName,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
