import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { Otp } from '../models/otp.model';
import { env } from '../config/env';
import crypto from 'crypto';
import { sendOtpEmail } from '../services/email.service';
import bcrypt from 'bcryptjs';

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();
  
  // Clear any existing verification OTPs for this email to prevent spam
  await Otp.deleteMany({ email: normalizedEmail, type: 'verification' });

  const otpCode = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email: normalizedEmail, otp: otpCode, type: 'verification' });

  const sent = await sendOtpEmail(normalizedEmail, otpCode);
  if (sent) {
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to send OTP email' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, password, displayName, gameId } = req.body;
  const normalizedEmail = email.toLowerCase();
  
  // Check against DB instead of memory
  const otpRecord = await Otp.findOne({ email: normalizedEmail, otp, type: 'verification' });
  if (!otpRecord) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    // Consume the OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      // It's a new registration, so we require a password, displayName, and gameId
      if (!password || !displayName || !gameId) {
        return res.status(400).json({ success: false, message: 'Password, Display Name, and Free Fire UID are required to register a new account' });
      }

      isNewUser = true;
      const uid = crypto.randomUUID(); 
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({ 
        uid, 
        email: normalizedEmail, 
        password: hashedPassword,
        displayName,
        gameId, // Save the Free Fire UID!
        role: 'player', 
        status: 'active', 
        eligibilityStatus: 'pending' 
      });

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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ uid: user.uid, role: user.role }, env.jwtSecret, { expiresIn: '30d' });

    res.status(200).json({
      success: true, token,
      user: { uid: user.uid, email: user.email, role: user.role, displayName: user.displayName }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await Otp.deleteMany({ email: normalizedEmail, type: 'reset' });

  const otpCode = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email: normalizedEmail, otp: otpCode, type: 'reset' });

  const sent = await sendOtpEmail(normalizedEmail, otpCode);
  if (sent) {
    res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase();
  
  const otpRecord = await Otp.findOne({ email: normalizedEmail, otp, type: 'reset' });
  if (!otpRecord) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });
    
    // Consume OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
