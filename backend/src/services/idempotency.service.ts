import { WalletTransaction } from '../models/walletTransaction.model';
import mongoose from 'mongoose';

/**
 * Checks if an idempotency key has already been used.
 * We rely on MongoDB's unique index on `idempotencyKey` in WalletTransaction for concurrency safety,
 * but this is useful for checking beforehand.
 */
export const isKeyUsed = async (
  idempotencyKey: string,
  session?: mongoose.ClientSession
): Promise<boolean> => {
  const existing = await WalletTransaction.findOne({ idempotencyKey }).session(session || null);
  return !!existing;
};
