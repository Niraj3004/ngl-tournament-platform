import { Request, Response } from 'express';
import { Match } from '../models/match.model';
import { writeAuditLog } from '../services/audit.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import { MatchParticipant } from '../models/matchParticipant.model';
import { writeTxn } from '../services/ledger.service';

export const getAllTournaments = async (req: Request, res: Response) => {
  try {
    const matches = await Match.find({}).select('-roomDetails').sort({ matchTime: 1 });
    res.status(200).json({ success: true, matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId).select('-roomDetails');
    if (!match) return res.status(404).json({ success: false, message: 'Tournament not found' });
    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const match = await Match.create(req.body);
    await writeAuditLog(req.user!.uid, 'create_tournament', { matchId: match._id, title: match.title }, match._id.toString(), 'Match');
    res.status(201).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findByIdAndUpdate(matchId, req.body, { new: true });
    if (!match) return res.status(404).json({ success: false, message: 'Tournament not found' });
    
    await writeAuditLog(req.user!.uid, 'edit_tournament', { matchId: match._id, updates: Object.keys(req.body) }, match._id.toString(), 'Match');
    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeTournamentLifecycle = async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { action } = req.body; 

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Tournament not found' });

    let newStatus = match.status;
    switch (action) {
      case 'publish': newStatus = 'open'; break;
      case 'closeRegistration': newStatus = 'registration_closed'; break;
      case 'revealRoom': newStatus = 'room_revealed'; break;
      case 'start': newStatus = 'started'; break;
      case 'complete': newStatus = 'completed'; break;
      case 'cancel': newStatus = 'cancelled'; break;
      default: return res.status(400).json({ success: false, message: 'Invalid lifecycle action' });
    }

    match.status = newStatus as any;
    await match.save();

    await writeAuditLog(req.user!.uid, `lifecycle_${action}`, { matchId: match._id, status: newStatus }, match._id.toString(), 'Match');
    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinTournament = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { matchId } = req.params;
    const { gameId } = req.body;
    const uid = req.user!.uid;

    if (!gameId) {
      throw new Error('In-game ID is required to join');
    }

    // 1. Verify Match exists and is open
    const match = await Match.findById(matchId).session(session);
    if (!match) throw new Error('Tournament not found');
    if (match.status !== 'open') throw new Error('Registration is closed for this tournament');
    
    if (match.participantCount >= match.maxParticipants) {
      throw new Error('Tournament is full');
    }

    // 2. Check if already joined (the DB index also protects against this, but good to check)
    const existingEntry = await MatchParticipant.findOne({ matchId, uid }).session(session);
    if (existingEntry) {
      throw new Error('You have already joined this tournament');
    }

    // 3. Deduct entry fee via Ledger (will throw if insufficient balance)
    if (match.entryFee > 0) {
      await writeTxn(
        uid,
        'tournament_entry',
        -match.entryFee, // Negative for debit
        { description: `Entry fee for ${match.title}`, referenceId: match._id.toString() },
        `join_${match._id.toString()}_${uid}`,
        session
      );
    }

    // 4. Create participant record
    await MatchParticipant.create(
      [
        {
          matchId: match._id,
          uid,
          gameId,
          entryFeePaid: match.entryFee,
        },
      ],
      { session }
    );

    // 5. Increment participant count on Match
    match.participantCount += 1;
    await match.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Successfully joined tournament' });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
