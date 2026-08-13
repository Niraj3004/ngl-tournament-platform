import { Response } from 'express';
import mongoose from 'mongoose';
import { Withdrawal } from '../models/withdrawal.model';
import { lockFunds, resolveLockedFunds } from '../services/ledger.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount, accountDetails } = req.body;
    const uid = req.user!.uid;

    if (!amount || amount < 50) throw new Error('Minimum withdrawal amount is 50');
    if (!accountDetails) throw new Error('Account details are required');

    // 1. Create pending withdrawal record
    const withdrawal = await Withdrawal.create(
      [{
        uid,
        amount,
        accountDetails,
        status: 'pending',
      }],
      { session }
    );

    // 2. Lock the funds
    await lockFunds(
      uid,
      amount,
      { description: 'Withdrawal requested', referenceId: withdrawal[0]._id.toString() },
      `withdraw_req_${withdrawal[0]._id.toString()}`,
      session
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, withdrawal: withdrawal[0] });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({ uid: req.user!.uid }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({ status: { $in: ['pending', 'approved'] } }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const adminUid = req.user!.uid;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ success: false, message: 'Withdrawal is not pending' });

    withdrawal.status = 'approved';
    withdrawal.processedBy = adminUid;
    await withdrawal.save();

    res.status(200).json({ success: true, message: 'Withdrawal approved', withdrawal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markWithdrawalPaid = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const adminUid = req.user!.uid;

    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'approved') throw new Error('Withdrawal must be approved before marking paid');

    // Resolve locked funds (money leaves system)
    await resolveLockedFunds(
      withdrawal.uid,
      withdrawal.amount,
      'paid',
      { description: 'Withdrawal paid out' },
      `withdraw_paid_${withdrawal._id.toString()}`,
      session
    );

    withdrawal.status = 'paid';
    withdrawal.processedBy = adminUid;
    withdrawal.processedAt = new Date();
    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Withdrawal marked as paid', withdrawal });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;
    const adminUid = req.user!.uid;

    if (!reason) throw new Error('Rejection reason is required');

    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status === 'paid' || withdrawal.status === 'rejected' || withdrawal.status === 'cancelled') {
      throw new Error(`Cannot reject withdrawal with status: ${withdrawal.status}`);
    }

    // Refund locked funds back to available balance
    await resolveLockedFunds(
      withdrawal.uid,
      withdrawal.amount,
      'refunded',
      { description: 'Withdrawal rejected/refunded', referenceId: withdrawal._id.toString() },
      `withdraw_refund_${withdrawal._id.toString()}`,
      session
    );

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    withdrawal.processedBy = adminUid;
    withdrawal.processedAt = new Date();
    await withdrawal.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Withdrawal rejected and refunded', withdrawal });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
