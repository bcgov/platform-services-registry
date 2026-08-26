import prisma from '@/core/prisma';
import { Prisma, Provider } from '@/prisma/client';
import type { BillingPeriod } from './types';

export function financeIngestLockKey(provider: Provider, period: BillingPeriod) {
  return `${provider}:${period.year}-${period.month}`;
}

export async function acquireIngestLock(provider: Provider, period: BillingPeriod) {
  const key = financeIngestLockKey(provider, period);
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
