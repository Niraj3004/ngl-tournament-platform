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
  adjustUserBalance,
  getAnalytics
} from '../controllers/admin.controller';

import { getDisputes, resolveDispute } from '../controllers/admin.dispute.controller';
import { getConfig, updateConfig } from '../controllers/config.controller';

const router = Router();

// Apply auth and admin middleware to all routes in this file
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/analytics', getAnalytics);
router.get('/system-logs', getSystemLogs);
router.get('/withdrawals', getPendingWithdrawals);
router.post('/withdrawals/:id/resolve', resolveWithdrawal);
router.get('/deposits', getPendingDeposits);
router.post('/deposits/:id/resolve', resolveDeposit);
router.get('/users', getUsers);
router.post('/users/:uid/balance', adjustUserBalance);

// Disputes
router.get('/disputes', getDisputes);
router.post('/disputes/:disputeId/resolve', resolveDispute);

// Config
router.get('/config', getConfig);
router.post('/config', updateConfig);

// Support
router.get('/support', require('../controllers/admin.controller').getSupportTickets);
router.post('/support/:ticketId/reply', require('../controllers/admin.controller').adminReplySupportTicket);

export default router;
