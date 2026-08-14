import { Response } from 'express';
import { Deposit } from '../models/deposit.model';
import { writeTxn } from '../services/ledger.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const submitDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, receiptUrl, transactionId } = req.body;
    const uid = req.user!.uid;

    if (!amount || amount < 10) {
      return res.status(400).json({ success: false, message: 'Minimum deposit is 10.' });
    }
    if (!receiptUrl) {
      return res.status(400).json({ success: false, message: 'Receipt URL is required.' });
    }

    const deposit = await Deposit.create({
      uid,
      amount,
      receiptUrl,
      transactionId,
      status: 'pending',
    });

    res.status(201).json({ success: true, deposit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, deposits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { depositId } = req.params;
    const adminUid = req.user!.uid;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== 'pending') throw new Error('Deposit is not pending');

    // Update deposit status
    deposit.status = 'approved';
    deposit.processedBy = adminUid;
    await deposit.save();

    // Credit user's wallet
    await writeTxn(
      deposit.uid,
      'deposit',
      deposit.amount,
      { description: 'Manual deposit approved', referenceId: deposit._id.toString() },
      `deposit_approve_${deposit._id.toString()}`
    );

    res.status(200).json({ success: true, message: 'Deposit approved', deposit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { depositId } = req.params;
    const { reason } = req.body;
    const adminUid = req.user!.uid;

    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    if (deposit.status !== 'pending') return res.status(400).json({ success: false, message: 'Deposit is not pending' });

    deposit.status = 'rejected';
    deposit.rejectionReason = reason;
    deposit.processedBy = adminUid;
    await deposit.save();

    res.status(200).json({ success: true, message: 'Deposit rejected', deposit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
