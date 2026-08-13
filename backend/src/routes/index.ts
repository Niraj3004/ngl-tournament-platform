import { Router } from 'express';
import authRoutes from './auth.route';
import tournamentRoutes from './tournament.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentRoutes);

export default router;
