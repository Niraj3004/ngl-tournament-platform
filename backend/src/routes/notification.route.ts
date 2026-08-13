import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getMyNotifications, markNotificationsRead } from '../controllers/notification.controller';

const router = Router();

router.use(requireAuth);
router.get('/', getMyNotifications);
router.post('/mark-read', markNotificationsRead);

export default router;
