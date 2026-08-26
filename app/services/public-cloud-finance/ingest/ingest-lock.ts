import prisma from '@/core/prisma';
import { Prisma, Provider } from '@/prisma/client';
import type { BillingPeriod } from './types';

/** Longer than Airflow's 600s ingest timeout so a live run is not reclaimed. */
export const INGEST_LOCK_TTL_MS = 20 * 60 * 1000;

export function financeIngestLockKey(provider: Provider, period: BillingPeriod) {
  return `${provider}:${period.year}-${period.month}`;
}

export function isIngestLockStale(createdAt: Date, now = new Date()) {
  return now.getTime() - createdAt.getTime() > INGEST_LOCK_TTL_MS;
}

export async function acquireIngestLock(provider: Provider, period: BillingPeriod) {
  const key = financeIngestLockKey(provider, period);
  await prisma.ingestionLock.deleteMany({
    where: { key, createdAt: { lt: new Date(Date.now() - INGEST_LOCK_TTL_MS) } },
  });
  try {
    await prisma.ingestionLock.create({ data: { key } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`Ingest already running for ${provider} ${period.year}-${period.month}`);
    }
    throw error;
  }
  return key;
}

export async function releaseIngestLock(key: string) {
  await prisma.ingestionLock.deleteMany({ where: { key } });
}
