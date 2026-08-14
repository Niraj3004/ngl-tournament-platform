import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getMyReferralCode, getMyReferralStats, applyReferralCode } from '../controllers/referral.controller';

const router = Router();

router.get('/code', requireAuth, getMyReferralCode);
router.get('/stats', requireAuth, getMyReferralStats);
router.post('/apply', requireAuth, applyReferralCode);

export default router;
