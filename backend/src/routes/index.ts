import { Router } from 'express';
import authRoutes from './auth.route';
import tournamentRoutes from './tournament.route';
import depositRoutes from './deposit.route';
import paymentCodeRoutes from './paymentCode.route';
import withdrawalRoutes from './withdrawal.route';
import resultRoutes from './result.route';
import adminRoutes from './admin.route';
import notificationRoutes from './notification.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/tournaments/:matchId', resultRoutes);
router.use('/deposits', depositRoutes);
router.use('/payment-codes', paymentCodeRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;
