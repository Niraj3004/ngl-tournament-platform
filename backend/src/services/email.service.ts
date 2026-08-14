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
    if (env.emailUser && env.emailPass) {
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

// Base HTML Wrapper
const wrapHtml = (title: string, content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050507; color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #111122;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #ff6b00; margin: 0; text-transform: uppercase; font-size: 28px; letter-spacing: 2px;">NGL BATTLE</h1>
    </div>
    <div style="background-color: #0d0d1a; padding: 20px; border-radius: 6px; border-left: 4px solid #00c8ff;">
      <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
      <div style="color: #cccccc; line-height: 1.6; font-size: 15px;">
        ${content}
      </div>
    </div>
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666688;">
      &copy; ${new Date().getFullYear()} NGL Tournament Platform. All rights reserved.
    </div>
  </div>
`;

export const sendWithdrawalRequestEmail = async (email: string, amount: number) => {
  const subject = 'Withdrawal Request Received - NGL';
  const html = wrapHtml(
    'Withdrawal Requested',
    `<p>We have successfully received your request to withdraw <strong>Rs. ${amount}</strong>.</p>
     <p>Our team is currently reviewing it. Withdrawals are typically processed within 24-48 hours.</p>
     <p>You can check the status of your withdrawal anytime from your Wallet Dashboard.</p>`
  );
  return await sendEmail(email, subject, html);
};

export const sendWithdrawalApprovedEmail = async (email: string, amount: number) => {
  const subject = 'Withdrawal Approved & Paid - NGL';
  const html = wrapHtml(
    'Withdrawal Successful! 🎉',
    `<p>Great news! Your withdrawal of <strong>Rs. ${amount}</strong> has been approved and processed.</p>
     <p>The funds should reflect in your selected payment method shortly.</p>
     <p>Thank you for playing on NGL!</p>`
  );
  return await sendEmail(email, subject, html);
};

export const sendWithdrawalRejectedEmail = async (email: string, amount: number, reason: string) => {
  const subject = 'Withdrawal Rejected - NGL';
  const html = wrapHtml(
    'Withdrawal Update',
    `<p>Unfortunately, your withdrawal request for <strong>Rs. ${amount}</strong> was rejected.</p>
     <p><strong>Reason:</strong> <span style="color: #ff2244;">${reason}</span></p>
     <p>The funds have been refunded back to your NGL wallet balance.</p>
     <p>If you have any questions, please open a Support Ticket.</p>`
  );
  return await sendEmail(email, subject, html);
};

export const sendDisputeResolvedEmail = async (email: string, matchTitle: string, status: string, message: string) => {
  const subject = `Dispute Update: ${matchTitle}`;
  const html = wrapHtml(
    'Dispute Status Update',
    `<p>Your dispute regarding the match <strong>"${matchTitle}"</strong> has been reviewed by an admin.</p>
     <p><strong>Status:</strong> <span style="color: ${status === 'resolved' ? '#00ff88' : '#ff2244'}; text-transform: uppercase;">${status}</span></p>
     <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; margin-top: 15px;">
       <strong>Admin Message:</strong><br/>
       ${message}
     </div>`
  );
  return await sendEmail(email, subject, html);
};

export const sendTournamentResultEmail = async (email: string, matchTitle: string, prizeWon: number) => {
  const subject = `Tournament Results: ${matchTitle}`;
  const html = wrapHtml(
    'Tournament Concluded! 🏆',
    `<p>The results for <strong>"${matchTitle}"</strong> have been officially published!</p>
     ${prizeWon > 0 
       ? `<h3 style="color: #00ff88;">Congratulations! You won Rs. ${prizeWon}!</h3><p>The prize money has been credited directly to your wallet.</p>` 
       : `<p>You can check the full leaderboard on the tournament results page.</p>`}
     <p>Thanks for playing, and see you in the next drop!</p>`
  );
  return await sendEmail(email, subject, html);
};
