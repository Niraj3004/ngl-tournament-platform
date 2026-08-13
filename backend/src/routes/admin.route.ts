import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { getDashboardMetrics, getSystemLogs } from '../controllers/admin.controller';

const router = Router();

// Apply auth and admin middleware to all routes in this file
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/system-logs', getSystemLogs);

export default router;
