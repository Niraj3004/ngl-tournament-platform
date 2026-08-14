import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getMyTransactions, requestDeposit, requestWithdrawal } from '../controllers/wallet.controller';

const router = Router();

router.get('/transactions', requireAuth, getMyTransactions);
router.post('/deposit', requireAuth, requestDeposit);
router.post('/withdraw', requireAuth, requestWithdrawal);

export default router;
