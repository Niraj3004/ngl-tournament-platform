import { Router, Response, Request } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../lib/guards';
import { Match } from '../models/match.model';
import { writeAuditLog } from '../lib/audit';

const router = Router();

/**
 * @route GET /api/tournaments
 * @desc Public route to fetch all tournaments (hides room details)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Exclude roomDetails for public listing
    const matches = await Match.find({}).select('-roomDetails').sort({ matchTime: 1 });
    res.status(200).json({ success: true, matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route GET /api/tournaments/:matchId
 * @desc Public route to fetch a single tournament details
 */
router.get('/:matchId', async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    
    // Note: If the room is revealed and the user is joined, we should ideally show roomDetails.
    // For now, in the public route without auth, we strictly hide roomDetails.
    // The room reveal logic for eligible participants will be handled in B7 (My Matches & room reveal).
    const match = await Match.findById(matchId).select('-roomDetails');
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ADMIN ROUTES BELOW
// ==========================================
router.use(requireAuth, requireAdmin);

/**
 * @route POST /api/tournaments
 * @desc Admin creates a new tournament
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    // Status starts as 'open' or whatever is specified (usually 'open' after publishing, maybe 'draft' initially, but schema defaults to 'open')
    const match = await Match.create(data);

    await writeAuditLog(req.user!.uid, 'create_tournament', { matchId: match._id, title: match.title }, match._id.toString(), 'Match');

    res.status(201).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route PUT /api/tournaments/:matchId
 * @desc Admin edits an existing tournament
 */
router.put('/:matchId', async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const updateData = req.body;

    const match = await Match.findByIdAndUpdate(matchId, updateData, { new: true });
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    await writeAuditLog(req.user!.uid, 'edit_tournament', { matchId: match._id, updates: Object.keys(updateData) }, match._id.toString(), 'Match');

    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /api/tournaments/:matchId/lifecycle
 * @desc Admin drives the tournament lifecycle (publish, closeRegistration, revealRoom, start, complete, cancel)
 */
router.post('/:matchId/lifecycle', async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { action } = req.body; // 'publish', 'closeRegistration', 'revealRoom', 'start', 'complete', 'cancel'

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    let newStatus = match.status;

    switch (action) {
      case 'publish':
        newStatus = 'open';
        break;
      case 'closeRegistration':
        newStatus = 'registration_closed';
        break;
      case 'revealRoom':
        newStatus = 'room_revealed';
        // In a real app, this is where you might trigger FCM notifications to participants
        break;
      case 'start':
        newStatus = 'started';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        // Note: Actual refunding logic for 'cancel' will be implemented in B9
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid lifecycle action' });
    }

    match.status = newStatus as any;
    await match.save();

    await writeAuditLog(req.user!.uid, `lifecycle_${action}`, { matchId: match._id, status: newStatus }, match._id.toString(), 'Match');

    res.status(200).json({ success: true, match });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
