import mongoose from 'mongoose';
import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { isKeyUsed } from './idempotency';

export interface TxnMeta {
  description: string;
  referenceId?: string;
}

/**
 * Core financial function. 
 * Executes an atomic, idempotent wallet update inside a MongoDB transaction.
 * 
 * @param uid User ID
 * @param type Transaction type (e.g. deposit, tournament_entry)
 * @param amount Amount to adjust (positive for credit, negative for debit)
 * @param meta Description and optional referenceId
 * @param idempotencyKey Unique key to prevent double processing
 * @param session MongoDB ClientSession
 */
export const writeTxn = async (
  uid: string,
  type: 'deposit' | 'tournament_entry' | 'prize' | 'withdrawal' | 'refund' | 'referral_bonus' | 'signup_bonus' | 'admin_adjustment' | 'reversal',
  amount: number,
  meta: TxnMeta,
  idempotencyKey: string,
  session: mongoose.ClientSession
) => {
  // 1. Check Idempotency (prevent double-credit / double-debit)
  const alreadyProcessed = await isKeyUsed(idempotencyKey, session);
  if (alreadyProcessed) {
    throw new Error('Idempotency error: This transaction has already been processed.');
  }

  // 2. Fetch Wallet with exclusive lock (if using transactions)
  // To avoid race conditions, we update the wallet directly using $inc and return the new document
  const wallet = await Wallet.findOne({ uid }).session(session);
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // 3. Prevent Negative Balance on Debits
  if (amount < 0 && wallet.availableBalance + amount < 0) {
    throw new Error('Insufficient balance');
  }

  // 4. Atomically update wallet balance
  const updatedWallet = await Wallet.findOneAndUpdate(
    { uid },
    { $inc: { availableBalance: amount } },
    { new: true, session }
  );

  if (!updatedWallet) {
    throw new Error('Failed to update wallet');
  }

  // 5. Append immutable wallet transaction
  await WalletTransaction.create(
    [
      {
        uid,
        type,
        amount,
        balanceAfter: updatedWallet.availableBalance,
        description: meta.description,
        referenceId: meta.referenceId,
        idempotencyKey,
      },
    ],
    { session }
  );

  return updatedWallet;
};
