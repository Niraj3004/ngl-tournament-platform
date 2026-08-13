import { Response } from 'express';
import mongoose from 'mongoose';
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

    // Generate a secure random code (e.g. NGL-XXXXXXXX)
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { code } = req.body;
    const uid = req.user!.uid;

    if (!code) throw new Error('Payment code is required');

    // 1. Fetch code
    const paymentCode = await PaymentCode.findOne({ code }).session(session);
    if (!paymentCode) throw new Error('Invalid payment code');
    if (paymentCode.isRedeemed || paymentCode.status !== 'active') {
      throw new Error('This payment code has already been redeemed or deactivated');
    }
    if (new Date() > paymentCode.expiresAt) {
      throw new Error('This payment code has expired');
    }

    // 2. Mark code as redeemed
    paymentCode.isRedeemed = true;
    paymentCode.status = 'redeemed';
    paymentCode.redeemedBy = uid;
    paymentCode.redeemedAt = new Date();
    await paymentCode.save({ session });

    // 3. Credit wallet using the secure ledger
    await writeTxn(
      uid,
      'deposit', // Technically a deposit via payment code
      paymentCode.amount,
      { description: `Redeemed payment code: ${code}`, referenceId: paymentCode._id.toString() },
      `redeem_code_${paymentCode._id.toString()}`, // Idempotency key
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: `Successfully redeemed Rs.${paymentCode.amount}` });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
