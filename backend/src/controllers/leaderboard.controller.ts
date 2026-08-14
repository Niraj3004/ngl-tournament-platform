import { Request, Response } from 'express';
import { MatchParticipant } from '../models/matchParticipant.model';
import { User } from '../models/user.model';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { filter } = req.query; // 'today', 'week', 'month', 'all-time'
    
    let dateFilter = {};
    const now = new Date();
    if (filter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: today } };
    } else if (filter === 'week') {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (filter === 'month') {
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { $gte: lastMonth } };
    }

    const leaderboard = await MatchParticipant.aggregate([
      { $match: { status: 'joined', ...dateFilter } },
      {
        $group: {
          _id: '$uid',
          gameId: { $first: '$gameId' },
          totalKills: { $sum: '$kills' },
          totalPoints: { $sum: '$points' },
          totalPrizeWon: { $sum: '$prizeWon' },
          matchesPlayed: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1, totalKills: -1 } },
      { $limit: 100 }
    ]);

    // Populate user display names
    for (let entry of leaderboard) {
      const user = await User.findOne({ uid: entry._id }).select('displayName profilePhoto');
      if (user) {
        entry.displayName = user.displayName;
        entry.profilePhoto = user.profilePhoto;
      }
    }

    res.status(200).json({ success: true, leaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
