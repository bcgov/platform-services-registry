import {
  currentCalendarMonth,
  currentFiscalYearBounds,
  fiscalYearMonths,
  lastCompleteMonth,
  monthKey,
} from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Provider } from '@/prisma/client';
import type { BillingPeriod } from './types';

export const SCHEDULED_INGEST_PROVIDERS = [Provider.AWS_LZA, Provider.AZURE] as const;

export function elapsedCompleteFyMonths(through: BillingPeriod = lastCompleteMonth()): BillingPeriod[] {
  const fy = currentFiscalYearBounds(new Date(through.year, through.month - 1, 15));
  return fiscalYearMonths(fy.startYear).filter(
    (month) => month.year < through.year || (month.year === through.year && month.month <= through.month),
  );
}

export function filterMissingIngestPeriods(
  elapsed: BillingPeriod[],
  successfulPeriods: BillingPeriod[],
): BillingPeriod[] {
  const done = new Set(successfulPeriods.map((period) => monthKey(period.year, period.month)));
  return elapsed.filter((period) => !done.has(monthKey(period.year, period.month)));
}

export function periodsToIngest(missing: BillingPeriod[], target: BillingPeriod | BillingPeriod[]): BillingPeriod[] {
  const targets = Array.isArray(target) ? target : [target];
  const keys = new Set(missing.map((period) => monthKey(period.year, period.month)));
  for (const item of targets) keys.add(monthKey(item.year, item.month));
  return [...keys]
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      return { year, month };
    })
    .sort((left, right) => left.year - right.year || left.month - right.month);
}

/** Always refresh `through`. Also refresh last complete month so a mid-month SUCCESS does not freeze invoice close. */
export function ingestRefreshTargets(
  through: BillingPeriod,
  complete: BillingPeriod = lastCompleteMonth(),
): BillingPeriod[] {
  if (complete.year < through.year || (complete.year === through.year && complete.month < through.month)) {
    return [complete, through];
  }
  return [through];
}

export async function listMissingIngestPeriods(
  provider: Provider,
  through: BillingPeriod = lastCompleteMonth(),
): Promise<BillingPeriod[]> {
  const elapsed = elapsedCompleteFyMonths(through);
  const runs = await prisma.ingestionRun.findMany({
    where: { provider, status: FinanceIngestionStatus.SUCCESS, isScoped: false },
    select: { periodStart: true },
  });
  const successful = runs.map((run) => ({
    year: run.periodStart.getUTCFullYear(),
    month: run.periodStart.getUTCMonth() + 1,
  }));
  return filterMissingIngestPeriods(elapsed, successful);
}

export async function listScheduledIngestPlan(through: BillingPeriod = currentCalendarMonth()) {
  const targets = ingestRefreshTargets(through);
  const providers = await Promise.all(
    SCHEDULED_INGEST_PROVIDERS.map(async (provider) => {
      const missing = await listMissingIngestPeriods(provider, through);
      return { provider, periods: periodsToIngest(missing, targets) };
    }),
  );
  return { through, providers };
}

/** Classic AWS shares the LZA Cost Explorer estate and must not be ingested as a second provider. */
export function assertClassicAwsRealIngestAllowed(provider: Provider) {
  if (provider === Provider.AWS) {
    throw new Error('Classic AWS ingest is not supported for real billing data. Use AWS_LZA.');
  }
}
