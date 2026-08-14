import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getMyTransactions, requestWithdrawal } from '../controllers/wallet.controller';

const router = Router();

router.get('/transactions', requireAuth, getMyTransactions);
router.post('/withdraw', requireAuth, requestWithdrawal);

export default router;
