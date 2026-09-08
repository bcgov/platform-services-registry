import prisma from '@/core/prisma';
import { Provider } from '@/prisma/client';
import { IngestAlreadyRunningError, isUniqueConstraintError } from './ingest-errors';
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

  let created: { id: string };
  try {
    created = await prisma.ingestionLock.create({ data: { key } });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new IngestAlreadyRunningError(provider, period.year, period.month);
    }
    throw error;
  }

  const holders = await prisma.ingestionLock.count({ where: { key } });
  if (holders > 1) {
    await prisma.ingestionLock.deleteMany({ where: { id: created.id } });
    throw new IngestAlreadyRunningError(provider, period.year, period.month);
  }

  return created;
}

export async function releaseIngestLock(id: string) {
  await prisma.ingestionLock.deleteMany({ where: { id } });
}
