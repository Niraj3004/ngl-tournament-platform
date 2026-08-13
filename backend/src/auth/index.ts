import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { env } from '../config/env';
import crypto from 'crypto';

const router = Router();

// In-memory store for OTPs (For development/mocking purposes)
// In production, you would use Redis or send via Twilio/MSG91
const otpStore = new Map<string, string>();

/**
 * @route POST /api/auth/send-otp
 * @desc Sends an OTP to the user's phone (Mocked)
 */
router.post('/send-otp', async (req: Request, res: Response) => {
  const { phone, countryCode = '+977' } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  // Generate a 6-digit OTP (Mock: always '123456' in development, or random)
  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with phone number as key (Normally set an expiration)
  otpStore.set(`${countryCode}${phone}`, otp);

  // In production, integrate SMS API here.
  console.log(`[MOCK SMS] OTP for ${countryCode}${phone} is ${otp}`);

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Verifies OTP and logs in / registers the user
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
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
    // Clear the OTP
    otpStore.delete(fullPhone);

    let user = await User.findOne({ phone, countryCode });
    let isNewUser = false;

    if (!user) {
      // First sign-in: Create user and wallet at zero
      isNewUser = true;
      const uid = crypto.randomUUID(); // Generate a unique ID (replaces Firebase UID)

      user = await User.create({
        uid,
        phone,
        countryCode,
        role: 'player',
        status: 'active',
        eligibilityStatus: 'pending',
      });

      await Wallet.create({
        uid,
        availableBalance: 0,
        lockedBalance: 0,
      });

      // TODO: Apply signup bonus via Ledger (B4) when implemented
    } else if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    // Generate JWT
    const token = jwt.sign({ uid: user.uid, role: user.role }, env.jwtSecret, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      isNewUser,
      token,
      user: {
        uid: user.uid,
        phone: user.phone,
        role: user.role,
        displayName: user.displayName,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
