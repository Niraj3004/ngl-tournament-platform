import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Match } from '../models/match.model';
import { MatchParticipant } from '../models/matchParticipant.model';
import { writeTxn } from '../services/ledger.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Dispute } from '../models/dispute.model';

// Free Fire Standard Placement Points
const PLACEMENT_POINTS: Record<number, number> = {
  1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 
  6: 5, 7: 4, 8: 3, 9: 2, 10: 1
};
const KILL_POINTS_MULTIPLIER = 1;

export const enterResult = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { participantId, kills, placement } = req.body;

    if (kills === undefined || placement === undefined) {
      return res.status(400).json({ success: false, message: 'Kills and placement are required' });
    }

    const participant = await MatchParticipant.findOne({ _id: participantId, matchId });
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found in this match' });
    }

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (match.status === 'completed' || match.status === 'cancelled' || match.status === 'refunded') {
      return res.status(400).json({ success: false, message: `Cannot enter results for a match that is ${match.status}` });
    }

    // Calculate Points
    const placementPts = PLACEMENT_POINTS[placement] || 0;
    const totalPoints = (kills * KILL_POINTS_MULTIPLIER) + placementPts;

    participant.kills = kills;
    participant.placement = placement;
    participant.points = totalPoints;
    await participant.save();

    res.status(200).json({ success: true, message: 'Result updated', participant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishResults = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).session(session);
    if (!match) throw new Error('Match not found');
    if (match.status !== 'started' && match.status !== 'room_revealed') {
      throw new Error(`Cannot publish results from status: ${match.status}. Expected 'started'.`);
    }

    // Fetch all participants and sort by points descending (then kills descending for tie breaker)
    const participants = await MatchParticipant.find({ matchId, status: 'joined' })
      .sort({ points: -1, kills: -1 })
      .session(session);

    if (participants.length === 0) {
      throw new Error('No active participants found to distribute prizes to');
    }

    const prizeDist: any = match.prizeDistribution || {};

    // Distribute Prizes
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const rank = i + 1;
      const prizeVal = typeof prizeDist.get === 'function' ? prizeDist.get(rank.toString()) : prizeDist[rank.toString()];
      const prizeAmount = prizeVal ? Number(prizeVal) : 0;

      if (prizeAmount > 0) {
        // Securely credit prize money
        await writeTxn(
          p.uid,
          'prize',
          prizeAmount,
          { description: `Prize for ranking #${rank} in ${match.title}`, referenceId: match._id.toString() },
          `prize_${match._id.toString()}_${p.uid}`,
          session
        );
        p.prizeWon = prizeAmount;
        await p.save({ session });
      }
    }

    // Mark match as completed
    match.status = 'completed';
    await match.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Results published and prizes distributed successfully' });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMatchResults = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).select('title status');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const participants = await MatchParticipant.find({ matchId, status: 'joined' })
      .sort({ points: -1, kills: -1 })
      .select('uid gameId kills placement points prizeWon');
    
    res.status(200).json({ success: true, match, results: participants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { reason, description, evidenceUrls } = req.body;

    const dispute = await Dispute.create({
      matchId,
      uid: req.user!.uid,
      reason,
      description,
      evidenceUrls: evidenceUrls || []
    });

    res.status(201).json({ success: true, dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
