import { Response } from 'express';
import { SupportTicket } from '../models/supportTicket.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { category, subject, description, attachments } = req.body;
    
    const ticket = await SupportTicket.create({
      uid: req.user!.uid,
      category,
      subject,
      description,
      attachments: attachments || []
    });

    res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await SupportTicket.find({ uid: req.user!.uid }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    const ticket = await SupportTicket.findOne({ _id: ticketId, uid: req.user!.uid });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (ticket.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot reply to a closed ticket' });
    }

    ticket.messages.push({
      senderId: req.user!.uid,
      message,
      createdAt: new Date()
    });

    await ticket.save();
    res.status(200).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
