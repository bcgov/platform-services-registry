import {
  currentFiscalYearBounds,
  fiscalYearMonths,
  lastCompleteMonth,
  monthKey,
} from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Provider } from '@/prisma/client';
import { defaultFinanceBillingSource } from '../constants';
import type { BillingFetchScope, BillingPeriod } from './types';

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

export function periodsToIngest(missing: BillingPeriod[], target: BillingPeriod): BillingPeriod[] {
  const keys = new Set(missing.map((period) => monthKey(period.year, period.month)));
  const periods = keys.has(monthKey(target.year, target.month)) ? [...missing] : [...missing, target];
  return periods.sort((left, right) => left.year - right.year || left.month - right.month);
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

export async function listScheduledIngestPlan(through: BillingPeriod = lastCompleteMonth()) {
  const providers = await Promise.all(
    SCHEDULED_INGEST_PROVIDERS.map(async (provider) => {
      const missing = await listMissingIngestPeriods(provider, through);
      return { provider, periods: periodsToIngest(missing, through) };
    }),
  );
  return { through, providers };
}

export function isScopedAzureFetch(scope?: BillingFetchScope) {
  return Boolean(scope?.licencePlates?.length || scope?.accountIdentifiers?.length);
}

/**
 * Classic AWS shares the LZA Cost Explorer estate. Real ingest must use AWS_LZA
 * so the same dollars are not tagged twice. Simulated or an explicit source
 * (local live CLI) may still ingest AWS.
 */
export function assertClassicAwsRealIngestAllowed(
  provider: Provider,
  options: { forcedSource?: boolean; billingSource?: 'simulated' | 'real' } = {},
) {
  const billingSource = options.billingSource ?? defaultFinanceBillingSource();
  if (provider === Provider.AWS && !options.forcedSource && billingSource === 'real') {
    throw new Error('Classic AWS ingest is not supported on the real Cost Explorer path. Use AWS_LZA.');
  }
}
