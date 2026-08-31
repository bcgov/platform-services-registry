import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Provider } from '@/prisma/client';
import { activeActualSpendWhere, unresolvedUnmatchedWhere } from '../active-spend';
import { buildAccountToLicencePlateMap, collectKnownAccountIds } from '../billing-account-links';
import { loadProductBillingStartByPlate, platesToRollupForPeriod } from '../product-billing-start';
import { evaluateSpendFlagsForPeriod } from './evaluate-flags';
import { isUniqueConstraintError } from './ingest-errors';
import { acquireIngestLock, releaseIngestLock } from './ingest-lock';
import { assertClassicAwsRealIngestAllowed, elapsedCompleteFyMonths } from './missing-periods';
import { normalizeSourceLines } from './normalize-source-lines';
import { partitionMatchedUnmatched } from './partition-lines';
import type { BillingFetchScope, BillingPeriod, NormalizedBillingLine, SourceBillingLine } from './types';
import { planUnmatchedReconcile } from './unmatched-reconcile';

const WRITE_BATCH_SIZE = 25;

async function mapInBatches<T>(items: T[], fn: (item: T) => Promise<unknown>) {
  for (let index = 0; index < items.length; index += WRITE_BATCH_SIZE) {
    await Promise.all(items.slice(index, index + WRITE_BATCH_SIZE).map(fn));
  }
}

export type PersistBillingPeriodOptions = {
  provider: Provider;
  period: BillingPeriod;
  triggeredBy: string;
  lines: SourceBillingLine[];
  scope?: BillingFetchScope;
};

export type IngestResult = {
  runId: string;
  rowsLoaded: number;
  rowsUnmatched: number;
  flagsRaised: number;
  status: FinanceIngestionStatus;
};

function periodBounds(period: BillingPeriod) {
  const periodStart = new Date(Date.UTC(period.year, period.month - 1, 1));
  const periodEnd = new Date(Date.UTC(period.year, period.month, 0, 23, 59, 59, 999));
  return { periodStart, periodEnd };
}

async function loadProductsForAccountMap() {
  // Include INACTIVE so residual billing after archive still attaches to historical products.
  return prisma.publicCloudProduct.findMany({
    select: {
      licencePlate: true,
      provider: true,
      billingAccountLinks: true,
      awsAccounts: true,
      azureSubscriptions: true,
    },
  });
}

async function refreshRollupsForPeriod(provider: Provider, period: BillingPeriod, licencePlates: string[]) {
  const plates = [...new Set(licencePlates)];
  if (plates.length === 0) return;

  const groups = await prisma.actualSpend.groupBy({
    by: ['licencePlate'],
    where: {
      AND: [
        activeActualSpendWhere,
        {
          licencePlate: { in: plates },
          provider,
          year: period.year,
          month: period.month,
        },
      ],
    },
    _sum: { amountCad: true },
  });
  const amountByPlate = new Map(groups.map((group) => [group.licencePlate, group._sum.amountCad ?? 0]));

  await mapInBatches(plates, async (licencePlate) => {
    const amountCad = amountByPlate.get(licencePlate) ?? 0;
    const where = {
      licencePlate_provider_year_month: {
        licencePlate,
        provider,
        year: period.year,
        month: period.month,
      },
    };
    try {
      await prisma.monthlyProductSpendRollup.upsert({
        where,
        create: {
          licencePlate,
          provider,
          year: period.year,
          month: period.month,
          amountCad,
        },
        update: { amountCad },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      await prisma.monthlyProductSpendRollup.update({
        where,
        data: { amountCad },
      });
    }
  });
}

function resolveSupersedeLicencePlateFilter(
  scope?: BillingFetchScope,
): { licencePlate: { in: string[] } } | Record<string, never> {
  if (scope?.licencePlates?.length) {
    return { licencePlate: { in: scope.licencePlates } };
  }
  return {};
}

async function resolveRollupPlates(
  provider: Provider,
  period: BillingPeriod,
  matchedPlates: string[],
  scope?: BillingFetchScope,
): Promise<string[]> {
  const products = await prisma.publicCloudProduct.findMany({
    where: {
      provider,
      ...(scope?.licencePlates?.length ? { licencePlate: { in: scope.licencePlates } } : {}),
    },
    select: { licencePlate: true, createdAt: true },
  });
  const billingStartedByPlate = await loadProductBillingStartByPlate(products.map((product) => product.licencePlate));
  return platesToRollupForPeriod({
    products: products.map((product) => ({
      licencePlate: product.licencePlate,
      billingStartedAt: billingStartedByPlate.get(product.licencePlate) ?? product.createdAt,
    })),
    period,
    matchedPlates,
  });
}

async function writeMatchedAndSupersede(options: {
  provider: Provider;
  period: BillingPeriod;
  runId: string;
  matched: Array<NormalizedBillingLine & { licencePlate: string }>;
  scope?: BillingFetchScope;
}) {
  const { provider, period, runId, matched, scope } = options;

  const existing = await prisma.actualSpend.findMany({
    where: {
      AND: [
        activeActualSpendWhere,
        {
          provider,
          year: period.year,
          month: period.month,
          ...resolveSupersedeLicencePlateFilter(scope),
        },
      ],
    },
    select: { id: true },
  });

  // Supersede first so a crash cannot leave two active generations (double-count).
  if (existing.length > 0) {
    await prisma.actualSpend.updateMany({
      where: { id: { in: existing.map((row) => row.id) } },
      data: { supersededBy: runId },
    });
  }

  if (matched.length > 0) {
    await prisma.actualSpend.createMany({
      data: matched.map((line) => ({
        licencePlate: line.licencePlate,
        provider: line.provider,
        serviceLine: line.serviceLine,
        year: line.year,
        month: line.month,
        amountCad: line.amountCad,
        sourceCurrency: line.sourceCurrency,
        fxRate: line.fxRate,
        fxRateDate: line.fxRateDate,
        ingestionRunId: runId,
        supersededBy: null,
      })),
    });
  }

  const marker = await prisma.actualSpend.findFirst({
    where: {
      ingestionRunId: runId,
      provider,
      year: period.year,
      month: period.month,
    },
    select: { id: true },
  });

  if (existing.length > 0 && marker) {
    await prisma.actualSpend.updateMany({
      where: { id: { in: existing.map((row) => row.id) } },
      data: { supersededBy: marker.id },
    });
  }
}

async function writeUnmatched(
  provider: Provider,
  period: BillingPeriod,
  runId: string,
  unmatched: NormalizedBillingLine[],
  scope?: BillingFetchScope,
) {
  const existing = await prisma.unmatchedBillingLine.findMany({
    where: { provider, year: period.year, month: period.month },
  });
  const scopedAccounts = scope?.accountIdentifiers?.length
    ? new Set(scope.accountIdentifiers.map((id) => id.toLowerCase()))
    : null;
  const existingInScope = scopedAccounts
    ? existing.filter((row) => scopedAccounts.has(row.accountIdentifier.toLowerCase()))
    : existing;
  const plan = planUnmatchedReconcile(existingInScope, unmatched);

  if (plan.staleIds.length > 0) {
    await prisma.unmatchedBillingLine.deleteMany({
      where: { id: { in: plan.staleIds }, AND: [unresolvedUnmatchedWhere] },
    });
  }
  if (plan.toCreate.length > 0) {
    await prisma.unmatchedBillingLine.createMany({
      data: plan.toCreate.map((line) => ({
        provider: line.provider,
        accountIdentifier: line.accountIdentifier,
        serviceLine: line.serviceLine,
        year: line.year,
        month: line.month,
        amountCad: line.amountCad,
        sourceCurrency: line.sourceCurrency,
        fxRate: line.fxRate,
        fxRateDate: line.fxRateDate,
        ingestionRunId: runId,
      })),
    });
  }
  await mapInBatches(plan.toUpdate, (row) =>
    prisma.unmatchedBillingLine.update({
      where: { id: row.id },
      data: {
        amountCad: row.amountCad,
        sourceCurrency: row.sourceCurrency,
        fxRate: row.fxRate,
        fxRateDate: row.fxRateDate,
        ingestionRunId: runId,
      },
    }),
  );
}

/**
 * Idempotent month ingest: supersede prior active lines for the provider/period (scoped),
 * write new lines, refresh rollups, evaluate flags.
 */
async function evaluateFlagsForPeriodAndLater(period: BillingPeriod) {
  const flagsRaised = await evaluateSpendFlagsForPeriod(period);
  const later = elapsedCompleteFyMonths().filter(
    (month) => month.year > period.year || (month.year === period.year && month.month > period.month),
  );
  for (const month of later) {
    const hasRollup = await prisma.monthlyProductSpendRollup.findFirst({
      where: { year: month.year, month: month.month },
      select: { id: true },
    });
    if (hasRollup) await evaluateSpendFlagsForPeriod(month);
  }
  return flagsRaised;
}

async function executeIngestRun(options: {
  provider: Provider;
  period: BillingPeriod;
  triggeredBy: string;
  lines: SourceBillingLine[];
  scope?: BillingFetchScope;
}): Promise<IngestResult> {
  const { provider, period, triggeredBy, scope } = options;
  const { periodStart, periodEnd } = periodBounds(period);
  const isScoped = Boolean(scope?.licencePlates?.length || scope?.accountIdentifiers?.length);
  const lockKey = await acquireIngestLock(provider, period);

  let run: { id: string } | undefined;
  try {
    run = await prisma.ingestionRun.create({
      data: {
        provider,
        periodStart,
        periodEnd,
        status: FinanceIngestionStatus.RUNNING,
        triggeredBy,
        isScoped,
      },
    });
    const products = await loadProductsForAccountMap();
    const { map: accountMap, collisions } = buildAccountToLicencePlateMap(products);
    if (collisions.length > 0) {
      logger.warn('Duplicate billing account links omitted from ingest join', { collisions });
    }

    const lines = await normalizeSourceLines(options.lines, provider, period, scope);

    const { matched, unmatched } = partitionMatchedUnmatched(
      lines,
      accountMap,
      collectKnownAccountIds(products),
      collisions,
    );
    const matchedPlates = [...new Set(matched.map((m) => m.licencePlate))];

    await writeMatchedAndSupersede({
      provider,
      period,
      runId: run.id,
      matched,
      scope,
    });
    await writeUnmatched(provider, period, run.id, unmatched, scope);

    const rollupPlates = await resolveRollupPlates(provider, period, matchedPlates, scope);
    await refreshRollupsForPeriod(provider, period, rollupPlates);
    const flagsRaised = await evaluateFlagsForPeriodAndLater(period);

    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: FinanceIngestionStatus.SUCCESS,
        completedAt: new Date(),
        rowsLoaded: matched.length,
        rowsUnmatched: unmatched.length,
      },
    });

    return {
      runId: run.id,
      rowsLoaded: matched.length,
      rowsUnmatched: unmatched.length,
      flagsRaised,
      status: FinanceIngestionStatus.SUCCESS,
    };
  } catch (error) {
    if (run) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.ingestionRun.update({
        where: { id: run.id },
        data: {
          status: FinanceIngestionStatus.FAILED,
          completedAt: new Date(),
          errorMessage: message.slice(0, 2000),
        },
      });
    }
    throw error;
  } finally {
    await releaseIngestLock(lockKey);
  }
}

/** Persist already-fetched provider lines. Airflow (and tests) call this after fetch. */
export async function persistBillingPeriod(options: PersistBillingPeriodOptions): Promise<IngestResult> {
  assertClassicAwsRealIngestAllowed(options.provider);
  return executeIngestRun(options);
}
