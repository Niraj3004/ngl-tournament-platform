import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { 
  getAllTournaments, 
  getTournamentById, 
  createTournament, 
  updateTournament, 
  changeTournamentLifecycle,
  joinTournament,
  distributePrizes
} from '../controllers/tournament.controller';

const router = Router();

// Public routes
router.get('/', getAllTournaments);
router.get('/:matchId', getTournamentById);

// Player routes
router.post('/:matchId/join', requireAuth, joinTournament);

// Admin routes
router.post('/', requireAuth, requireAdmin, createTournament);
router.put('/:matchId', requireAuth, requireAdmin, updateTournament);
router.post('/:matchId/lifecycle', requireAuth, requireAdmin, changeTournamentLifecycle);
router.post('/:matchId/prizes', requireAuth, requireAdmin, distributePrizes);

export default router;
