import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { env } from '../config/env';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// In-memory store for OTPs
const otpStore = new Map<string, string>();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const otp = env.nodeEnv === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), otp);

  try {
    if (env.nodeEnv !== 'development' && env.emailUser) {
      await transporter.sendMail({
        from: env.emailFrom || env.emailUser,
        to: email,
        subject: 'Your Tournament Platform OTP',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire shortly.</p>`,
      });
      console.log(`[EMAIL] OTP sent to ${email}`);
    } else {
      console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);
    }
    
    res.status(200).json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

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

      user = await User.create({
        uid, 
        email: normalizedEmail, 
        role: 'player', 
        status: 'active', 
        eligibilityStatus: 'pending',
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
        uid: user.uid, 
        email: user.email, 
        role: user.role, 
        displayName: user.displayName,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
