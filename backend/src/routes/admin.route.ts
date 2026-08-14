import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { 
  getDashboardMetrics, 
  getSystemLogs, 
  getPendingWithdrawals, 
  resolveWithdrawal,
  getPendingDeposits,
  resolveDeposit,
  getUsers,
  adjustUserBalance
} from '../controllers/admin.controller';

const router = Router();

// Apply auth and admin middleware to all routes in this file
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/system-logs', getSystemLogs);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/resolve', resolveWithdrawal);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/resolve', resolveDeposit);
router.get('/users', getUsers);
router.post('/users/:uid/balance', adjustUserBalance);

export default router;
