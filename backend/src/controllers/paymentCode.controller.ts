import { Response } from 'express';
import crypto from 'crypto';
import { PaymentCode } from '../models/paymentCode.model';
import { writeTxn } from '../services/ledger.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const generatePaymentCode = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, expiresAt } = req.body;
    const adminUid = req.user!.uid;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    if (!expiresAt) return res.status(400).json({ success: false, message: 'Expiration date is required' });

    const code = `NGL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const paymentCode = await PaymentCode.create({
      code,
      amount,
      expiresAt: new Date(expiresAt),
      createdBy: adminUid,
      status: 'active',
      isRedeemed: false,
    });

    res.status(201).json({ success: true, paymentCode });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const redeemPaymentCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const uid = req.user!.uid;

    if (!code) throw new Error('Payment code is required');

    const paymentCode = await PaymentCode.findOne({ code });
    if (!paymentCode) throw new Error('Invalid payment code');
    if (paymentCode.isRedeemed || paymentCode.status !== 'active') {
      throw new Error('This payment code has already been redeemed or deactivated');
    }
    if (new Date() > paymentCode.expiresAt) {
      throw new Error('This payment code has expired');
    }

    // Mark code as redeemed first to prevent race conditions
    paymentCode.isRedeemed = true;
    paymentCode.status = 'redeemed';
    paymentCode.redeemedBy = uid;
    paymentCode.redeemedAt = new Date();
    await paymentCode.save();

    // Credit wallet
    await writeTxn(
      uid,
      'deposit',
      paymentCode.amount,
      { description: `Redeemed payment code: ${code}`, referenceId: paymentCode._id.toString() },
      `redeem_code_${paymentCode._id.toString()}`
    );

    res.status(200).json({ success: true, message: `Successfully redeemed Rs.${paymentCode.amount}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentCodes = async (req: AuthRequest, res: Response) => {
  try {
    const codes = await PaymentCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, codes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
