import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { WalletTransaction } from '../models/walletTransaction.model';
import { writeTxn, lockFunds } from '../services/ledger.service';
import { v4 as uuidv4 } from 'uuid';

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    // Get latest 50 transactions for the user
    const transactions = await WalletTransaction.find({ uid })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestDeposit = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const uid = (req as any).user.uid;
    const { amount, method } = req.body;
    
    // For now, auto-approve deposit for testing
    await writeTxn(
      uid,
      'deposit',
      Number(amount),
      { description: `Deposit via ${method}` },
      uuidv4(),
      session
    );

    await session.commitTransaction();
    res.status(200).json({ success: true, message: 'Deposit successful' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const uid = (req as any).user.uid;
    const { amount, method, account } = req.body;
    
    // Lock funds for withdrawal
    await lockFunds(
      uid,
      Number(amount),
      { description: `Withdrawal request to ${method} (${account})` },
      uuidv4(),
      session
    );

    await session.commitTransaction();
    res.status(200).json({ success: true, message: 'Withdrawal requested successfully' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
