import { Response } from 'express';
import { Dispute } from '../models/dispute.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
import { sendDisputeResolvedEmail } from '../services/email.service';

export const getDisputes = async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await Dispute.find().sort({ createdAt: -1 }).populate('matchId', 'title status');
    res.status(200).json({ success: true, disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { status, resolutionMessage } = req.body;

    if (!['resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { status, resolutionMessage },
      { new: true }
    ).populate('matchId', 'title');

    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    // Send email
    const user = await User.findOne({ uid: dispute.uid });
    if (user && user.email) {
      sendDisputeResolvedEmail(
        user.email, 
        (dispute.matchId as any)?.title || 'Tournament Match', 
        status, 
        resolutionMessage
      ).catch(console.error);
    }

    res.status(200).json({ success: true, dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
