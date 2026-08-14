import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { getAllTournaments, getTournamentById, createTournament, updateTournament, changeTournamentLifecycle, joinTournament, distributePrizes, getMyMatches } from '../controllers/tournament.controller';

const router = Router();

// Public routes
router.get('/', getAllTournaments);

// Player routes
router.get('/my', requireAuth, getMyMatches);
router.get('/:matchId', getTournamentById);
router.post('/:matchId/join', requireAuth, joinTournament);

// Admin routes
router.post('/', requireAuth, requireAdmin, createTournament);
router.put('/:matchId', requireAuth, requireAdmin, updateTournament);
router.post('/:matchId/lifecycle', requireAuth, requireAdmin, changeTournamentLifecycle);
router.post('/:matchId/prizes', requireAuth, requireAdmin, distributePrizes);

export default router;
