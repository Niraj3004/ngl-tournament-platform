import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { createTicket, getMyTickets, replyToTicket } from '../controllers/support.controller';

const router = Router();

router.post('/', requireAuth, createTicket);
router.get('/', requireAuth, getMyTickets);
router.post('/:ticketId/reply', requireAuth, replyToTicket);

export default router;
