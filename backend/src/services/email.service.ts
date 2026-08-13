import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (env.nodeEnv !== 'development' && env.emailUser) {
      await transporter.sendMail({
        from: env.emailFrom || env.emailUser,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    } else {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Content: ${html}`);
    }
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const sendOtpEmail = async (email: string, otp: string) => {
  const subject = 'Your Tournament Platform OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <h2>Verification Code</h2>
      <p>Your OTP code is:</p>
      <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};
