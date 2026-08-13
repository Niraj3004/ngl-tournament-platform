import { Request, Response } from 'express';
import { Match } from '../models/match.model';
import { writeAuditLog } from '../services/audit.service';
import { AuthRequest } from '../middlewares/auth.middleware';

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
