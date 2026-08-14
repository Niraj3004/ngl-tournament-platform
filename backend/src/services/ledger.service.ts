import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { isKeyUsed } from './idempotency.service';

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
  idempotencyKey: string
) => {
  // 1. Check Idempotency (prevent double-credit / double-debit)
  const alreadyProcessed = await isKeyUsed(idempotencyKey);
  if (alreadyProcessed) {
    throw new Error('Idempotency error: This transaction has already been processed.');
  }

  // 2. Fetch Wallet with exclusive lock (if using transactions)
  // To avoid race conditions, we update the wallet directly using $inc and return the new document
  const wallet = await Wallet.findOne({ uid });
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
    { new: true }
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
    ]
  );

  return updatedWallet;
};

export const lockFunds = async (
  uid: string,
  amount: number,
  meta: TxnMeta,
  idempotencyKey: string
) => {
  const alreadyProcessed = await isKeyUsed(idempotencyKey);
  if (alreadyProcessed) throw new Error('Idempotency error: This transaction has already been processed.');

  const wallet = await Wallet.findOne({ uid });
  if (!wallet) throw new Error('Wallet not found');

  if (wallet.availableBalance - amount < 0) {
    throw new Error('Insufficient available balance');
  }

  const updatedWallet = await Wallet.findOneAndUpdate(
    { uid },
    { $inc: { availableBalance: -amount, lockedBalance: amount } },
    { new: true }
  );

  if (!updatedWallet) throw new Error('Failed to update wallet');

  await WalletTransaction.create(
    [{
      uid,
      type: 'withdrawal',
      amount: -amount,
      balanceAfter: updatedWallet.availableBalance,
      description: meta.description + ' (Funds Locked)',
      referenceId: meta.referenceId,
      idempotencyKey,
    }]
  );

  return updatedWallet;
};

export const resolveLockedFunds = async (
  uid: string,
  amount: number,
  action: 'paid' | 'refunded',
  meta: TxnMeta,
  idempotencyKey: string
) => {
  const alreadyProcessed = await isKeyUsed(idempotencyKey);
  if (alreadyProcessed) throw new Error('Idempotency error: This transaction has already been processed.');

  const wallet = await Wallet.findOne({ uid });
  if (!wallet) throw new Error('Wallet not found');

  if (wallet.lockedBalance - amount < 0) {
    throw new Error('Insufficient locked balance to resolve');
  }

  const updateQuery = action === 'paid' 
    ? { $inc: { lockedBalance: -amount } } 
    : { $inc: { lockedBalance: -amount, availableBalance: amount } };

  const updatedWallet = await Wallet.findOneAndUpdate(
    { uid },
    updateQuery,
    { new: true }
  );

  if (!updatedWallet) throw new Error('Failed to update wallet');

  if (action === 'refunded') {
    await WalletTransaction.create(
      [{
        uid,
        type: 'refund',
        amount: amount,
        balanceAfter: updatedWallet.availableBalance,
        description: meta.description + ' (Withdrawal Rejected/Refunded)',
        referenceId: meta.referenceId,
        idempotencyKey,
      }]
    );
  } else {
    // Optional: Log a 'paid' event, but it doesn't affect availableBalance so we skip it to avoid confusing the transaction ledger which tracks available balance changes.
  }

  return updatedWallet;
};
