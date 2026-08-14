import { WalletTransaction } from '../models/walletTransaction.model';

/**
 * Checks if an idempotency key has already been used.
 * We rely on MongoDB's unique index on `idempotencyKey` in WalletTransaction for concurrency safety,
 * but this is useful for checking beforehand.
 */
export const isKeyUsed = async (
  idempotencyKey: string
): Promise<boolean> => {
  const existing = await WalletTransaction.findOne({ idempotencyKey });
  return !!existing;
};
