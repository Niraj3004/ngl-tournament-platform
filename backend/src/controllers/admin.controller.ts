import { Response } from 'express';
import { User } from '../models/user.model';
import { Deposit } from '../models/deposit.model';
import { Match } from '../models/match.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { AdminAuditLog } from '../models/auditLog.model';
import { AuthRequest } from '../middlewares/auth.middleware';

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
