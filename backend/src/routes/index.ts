import { Router } from 'express';
import authRoutes from './auth.route';
import tournamentRoutes from './tournament.route';
import depositRoutes from './deposit.route';
import paymentCodeRoutes from './paymentCode.route';
import withdrawalRoutes from './withdrawal.route';
import resultRoutes from './result.route';
import adminRoutes from './admin.route';
import notificationRoutes from './notification.route';
import walletRoutes from './wallet.route';
import leaderboardRoutes from './leaderboard.route';
import supportRoutes from './support.route';
import referralRoutes from './referral.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/tournaments/:matchId', resultRoutes);
router.use('/deposits', depositRoutes);
router.use('/payment-codes', paymentCodeRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/wallet', walletRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/support', supportRoutes);
router.use('/referrals', referralRoutes);

export default router;
