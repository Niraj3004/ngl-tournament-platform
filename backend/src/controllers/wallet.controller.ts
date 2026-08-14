import { Request, Response } from 'express';
import { WalletTransaction } from '../models/walletTransaction.model';
import { lockFunds } from '../services/ledger.service';
import { v4 as uuidv4 } from 'uuid';

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const transactions = await WalletTransaction.find({ uid })
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user.uid;
    const { amount, method, account } = req.body;
    
    await lockFunds(
      uid,
      Number(amount),
      { description: `Withdrawal request to ${method} (${account})` },
      uuidv4()
    );

    res.status(200).json({ success: true, message: 'Withdrawal requested successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
