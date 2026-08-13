import { Router } from 'express';
import { sendOtp, verifyOtp, login, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
