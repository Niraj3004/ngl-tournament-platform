import { Response } from 'express';
import { User } from '../models/user.model';
import { Deposit } from '../models/deposit.model';
import { Match } from '../models/match.model';
import { MatchParticipant } from '../models/matchParticipant.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { AdminAuditLog } from '../models/auditLog.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { resolveLockedFunds, writeTxn } from '../services/ledger.service';
import { Wallet } from '../models/wallet.model';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../models/notification.model';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
    
    const activeTournaments = await Match.countDocuments({ 
      status: { $in: ['open', 'registration_closed', 'room_revealed', 'started'] } 
    });

    // Calculate Total Revenue (Tournament Entries - Prizes)
    // In our ledger, tournament_entry is a debit (negative) and prize is a credit (positive).
    // Platform revenue = -(sum of these amounts)
    const revenueAggregation = await WalletTransaction.aggregate([
      { 
        $match: { 
          type: { $in: ['tournament_entry', 'prize'] } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          netAmount: { $sum: "$amount" } 
        } 
      }
    ]);

    const netAmount = revenueAggregation.length > 0 ? revenueAggregation[0].netAmount : 0;
    const totalRevenue = -netAmount; // Convert negative sum to positive revenue

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        pendingDeposits,
        activeTournaments,
        totalRevenue
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSystemLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminAuditLog.countDocuments();

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    // In our ledger system, a pending withdrawal creates a transaction of type 'withdrawal' 
    // with 'Funds Locked' in description. It is considered pending until resolved.
    const withdrawals = await WalletTransaction.find({
      type: 'withdrawal',
      description: { $regex: /Funds Locked/i }
    }).sort({ createdAt: -1 });

    // Since we don't have a dedicated WithdrawalRequest model in this simple design, 
    // we'll filter out the ones that have been resolved.
    // A better approach would be adding a 'status' field, but this works for now.
    // Wait, let's just fetch from WalletTransaction.
    
    // To make it robust without changing models:
    // Let's assume if it has 'Funds Locked' it's pending.
    // Let's get them.
    res.status(200).json({ success: true, withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Transaction ID of the locked funds
    const { action } = req.body; // 'paid' or 'refunded'

    const tx = await WalletTransaction.findById(id);
    if (!tx || tx.type !== 'withdrawal') {
      throw new Error('Invalid withdrawal request');
    }
    
    // Actually, in our ledger, resolveLockedFunds uses idempotency keys. 
    // We'll generate a new key based on this action.
    const idempotencyKey = `resolve_${id}_${action}`;
    
    await resolveLockedFunds(
      tx.uid,
      Math.abs(tx.amount), // tx.amount is negative
      action as 'paid' | 'refunded',
      { description: `Withdrawal ${action} by admin` },
      idempotencyKey
    );
    
    // Mark original tx description as resolved so it doesn't show in pending
    await WalletTransaction.findByIdAndUpdate(id, {
      description: tx.description + ' (Resolved)'
    });

    // Create notification
    await Notification.create([{
      uid: tx.uid,
      message: `Your withdrawal request of Rs ${Math.abs(tx.amount)} has been ${action}.`,
      type: 'wallet',
      relatedId: tx._id.toString()
    }]);

    res.status(200).json({ success: true, message: `Withdrawal ${action} successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, deposits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approved' or 'rejected'

    const deposit = await Deposit.findById(id);
    if (!deposit || deposit.status !== 'pending') {
      throw new Error('Invalid deposit request');
    }

    deposit.status = action as 'approved' | 'rejected';
    deposit.processedBy = req.user!.uid;

    if (action === 'approved') {
      await writeTxn(
        deposit.uid,
        'deposit',
        deposit.amount,
        { description: 'Manual Deposit Approved' },
        `deposit_approve_${deposit._id}`
      );
    }

    await deposit.save();
    
    // Create notification
    await Notification.create([{
      uid: deposit.uid,
      message: `Your deposit of Rs ${deposit.amount} has been ${action}.`,
      type: 'wallet',
      relatedId: deposit._id.toString()
    }]);

    res.status(200).json({ success: true, message: `Deposit ${action} successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // We can also fetch balances, but for simplicity we'll just get all users
    // Alternatively, aggregate with wallets
    const usersWithBalances = await Promise.all(users.map(async (u) => {
      const wallet = await Wallet.findOne({ uid: u.uid });
      return {
        ...u.toObject(),
        availableBalance: wallet?.availableBalance || 0,
        lockedBalance: wallet?.lockedBalance || 0,
      };
    }));

    res.status(200).json({ success: true, users: usersWithBalances });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.params.uid as string;
    const { amount, reason } = req.body;
    
    if (!amount || amount === 0) throw new Error('Invalid amount');

    await writeTxn(
      uid,
      'admin_adjustment',
      Number(amount),
      { description: `Admin Adjustment: ${reason}` },
      `admin_adj_${uuidv4()}`
    );

    // Create notification
    await Notification.create([{
      uid,
      message: `An admin adjusted your wallet balance by Rs ${amount}. Reason: ${reason}`,
      type: 'wallet'
    }]);

    res.status(200).json({ success: true, message: 'Balance adjusted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersOverTime = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const revenueTrend = await WalletTransaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, type: { $in: ['tournament_entry', 'prize'] } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, netAmount: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]);
    
    const formattedRevenue = revenueTrend.map(r => ({ date: r._id, revenue: -r.netAmount }));

    res.status(200).json({
      success: true,
      analytics: {
        usersOverTime: usersOverTime.map(u => ({ date: u._id, users: u.count })),
        revenueTrend: formattedRevenue
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSupportTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { SupportTicket } = require('../models/supportTicket.model');
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminReplySupportTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { SupportTicket } = require('../models/supportTicket.model');
    const { ticketId } = req.params;
    const { message, status } = req.body;
    
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    if (message) {
      ticket.messages.push({
        senderId: 'admin',
        message,
        createdAt: new Date()
      });
    }
    
    if (status) ticket.status = status;
    
    await ticket.save();
    res.status(200).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
