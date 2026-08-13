import { Router } from 'express';
import authRoutes from './auth.route';
import tournamentRoutes from './tournament.route';
import depositRoutes from './deposit.route';
import paymentCodeRoutes from './paymentCode.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/deposits', depositRoutes);
router.use('/payment-codes', paymentCodeRoutes);

export default router;
