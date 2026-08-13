import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { enterResult, publishResults } from '../controllers/result.controller';

const router = Router({ mergeParams: true }); // Merge params to get matchId from parent route if needed

// Admin routes for entering and publishing results
router.post('/results', requireAuth, requireAdmin, enterResult);
router.post('/publish-results', requireAuth, requireAdmin, publishResults);

export default router;
