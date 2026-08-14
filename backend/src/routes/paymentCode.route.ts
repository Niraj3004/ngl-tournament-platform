import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { generatePaymentCode, redeemPaymentCode, getPaymentCodes } from '../controllers/paymentCode.controller';

const router = Router();

// Admin routes
router.post('/generate', requireAuth, requireAdmin, generatePaymentCode);
router.get('/', requireAuth, requireAdmin, getPaymentCodes);

// Player routes
router.post('/redeem', requireAuth, redeemPaymentCode);

export default router;
