import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { submitDeposit, getPendingDeposits, approveDeposit, rejectDeposit } from '../controllers/deposit.controller';

const router = Router();

// Player routes
router.post('/', requireAuth, submitDeposit);

// Admin routes
router.get('/pending', requireAuth, requireAdmin, getPendingDeposits);
router.post('/:depositId/approve', requireAuth, requireAdmin, approveDeposit);
router.post('/:depositId/reject', requireAuth, requireAdmin, rejectDeposit);

export default router;
