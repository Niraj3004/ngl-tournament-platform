import { Response } from 'express';
import { User } from '../models/user.model';
import { Referral } from '../models/referral.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

export const getMyReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    let user = await User.findOne({ uid: req.user!.uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.referralCode) {
      // Generate unique 6-char code
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      user.referralCode = code;
      await user.save();
    }

    res.status(200).json({ success: true, code: user.referralCode });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReferralStats = async (req: AuthRequest, res: Response) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user!.uid });
    
    const totalReferred = referrals.length;
    const totalEarned = referrals.reduce((sum, ref) => sum + ref.rewardAmount, 0);
    const pending = referrals.filter(r => r.status === 'pending').length;

    res.status(200).json({ 
      success: true, 
      stats: { totalReferred, totalEarned, pending },
      referrals 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }

    if (referrer.uid === req.user!.uid) {
      return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
    }

    const user = await User.findOne({ uid: req.user!.uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.referredBy) {
      return res.status(400).json({ success: false, message: 'You have already used a referral code' });
    }

    // Update user
    user.referredBy = referrer.uid;
    await user.save();

    // Create referral record
    await Referral.create({
      referrerId: referrer.uid,
      referredId: user.uid,
      status: 'pending', // Admins/system can process this later to pay out
      rewardAmount: 0
    });

    res.status(200).json({ success: true, message: 'Referral code applied successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
