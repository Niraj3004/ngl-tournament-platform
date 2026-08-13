import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { 
  requestWithdrawal, 
  getMyWithdrawals, 
  getPendingWithdrawals, 
  approveWithdrawal, 
  markWithdrawalPaid, 
  rejectWithdrawal 
} from '../controllers/withdrawal.controller';

const router = Router();

// Player routes
router.post('/', requireAuth, requestWithdrawal);
router.get('/my-requests', requireAuth, getMyWithdrawals);

// Admin routes
router.get('/pending', requireAuth, requireAdmin, getPendingWithdrawals);
router.post('/:withdrawalId/approve', requireAuth, requireAdmin, approveWithdrawal);
router.post('/:withdrawalId/mark-paid', requireAuth, requireAdmin, markWithdrawalPaid);
router.post('/:withdrawalId/reject', requireAuth, requireAdmin, rejectWithdrawal);

export default router;
