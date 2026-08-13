import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { env } from '../config/env';
import crypto from 'crypto';
import { sendOtpEmail } from '../services/email.service';
import bcrypt from 'bcryptjs';

// In-memory store for OTPs
const otpStore = new Map<string, string>();
const resetOtpStore = new Map<string, string>();

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required' });

  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), otp);

  const sent = await sendOtpEmail(email, otp);
  if (sent) {
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to send OTP email' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const normalizedEmail = email.toLowerCase();
  const storedOtp = otpStore.get(normalizedEmail);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    otpStore.delete(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const uid = crypto.randomUUID(); 
      user = await User.create({ uid, email: normalizedEmail, role: 'player', status: 'active', eligibilityStatus: 'pending' });
      await Wallet.create({ uid, availableBalance: 0, lockedBalance: 0 });
    } else if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    const token = jwt.sign({ uid: user.uid, role: user.role }, env.jwtSecret, { expiresIn: '30d' });

    res.status(200).json({
      success: true, isNewUser, token,
      user: { uid: user.uid, email: user.email, role: user.role, displayName: user.displayName }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  // In a purely stateless JWT setup, logout is handled by the client dropping the token.
  // This endpoint serves as a success response for the client to complete the flow.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  resetOtpStore.set(email.toLowerCase(), otp);

  const sent = await sendOtpEmail(email, otp);
  if (sent) {
    res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });

  const normalizedEmail = email.toLowerCase();
  const storedOtp = resetOtpStore.get(normalizedEmail);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });
    resetOtpStore.delete(normalizedEmail);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
