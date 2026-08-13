import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    displayName: z.string().min(3, 'Display name must be at least 3 characters').optional(),
    gameId: z.string().min(4, 'Free Fire UID must be at least 4 digits').optional(), // Adding Free Fire UID
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
