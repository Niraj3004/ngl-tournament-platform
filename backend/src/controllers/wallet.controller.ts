import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { WalletTransaction } from '../models/walletTransaction.model';
import { writeTxn, lockFunds } from '../services/ledger.service';
import { v4 as uuidv4 } from 'uuid';
import { Deposit } from '../models/deposit.model';

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
    
    // Instead of auto-approving, we create a pending Deposit request
    // In a real app, receiptUrl would come from a file upload (S3/Cloudinary)
    // For now, we mock it.
    await Deposit.create(
      [{
        uid,
        amount: Number(amount),
        receiptUrl: 'https://mock-receipt-url.com/receipt.jpg', // Mocked receipt
        status: 'pending',
        transactionId: uuidv4() // Or a user-provided ref number
      }],
      { session }
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
