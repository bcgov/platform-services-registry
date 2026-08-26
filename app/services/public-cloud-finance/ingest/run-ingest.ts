import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Prisma, Provider } from '@/prisma/client';
import { activeActualSpendWhere, unresolvedUnmatchedWhere } from '../active-spend';
import {
  accountJoinKey,
  buildAccountToLicencePlateMap,
  resolveBillingAccountIdentifiers,
} from '../billing-account-links';
import { defaultFinanceBillingSource } from '../constants';
import { loadProductBillingStartByPlate, platesToRollupForPeriod } from '../product-billing-start';
import { evaluateSpendFlagsForPeriod } from './evaluate-flags';
import { elapsedCompleteFyMonths } from './missing-periods';
import { createAwsBillingSource, createAzureBillingSource } from './real-sources';
import { createSimulatedBillingSource } from './simulated-source';
import type { BillingFetchScope, BillingPeriod, BillingSource, NormalizedBillingLine } from './types';
import { planUnmatchedReconcile } from './unmatched-reconcile';

export type IngestOptions = {
  provider: Provider;
  period: BillingPeriod;
  triggeredBy: string;
  source?: BillingSource;
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

export function resolveBillingSource(provider: Provider, forced?: BillingSource): BillingSource {
  if (forced) return forced;
  if (defaultFinanceBillingSource() === 'simulated') {
    return createSimulatedBillingSource();
  }
  if (provider === Provider.AZURE) return createAzureBillingSource();
  if (provider === Provider.AWS_LZA) return createAwsBillingSource(Provider.AWS_LZA);
  return createAwsBillingSource(Provider.AWS);
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

function accountIdentifiersForPlates(
  products: Awaited<ReturnType<typeof loadProductsForAccountMap>>,
  licencePlates: string[],
) {
  const wanted = new Set(licencePlates);
  return [
    ...new Set(
      products
        .filter((product) => wanted.has(product.licencePlate))
        .flatMap((product) => resolveBillingAccountIdentifiers(product).map((link) => link.accountIdentifier)),
    ),
  ];
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

  await Promise.all(
    plates.map((licencePlate) => {
      const amountCad = amountByPlate.get(licencePlate) ?? 0;
      return prisma.monthlyProductSpendRollup.upsert({
        where: {
          licencePlate_provider_year_month: {
            licencePlate,
            provider,
            year: period.year,
            month: period.month,
          },
        },
        create: {
          licencePlate,
          provider,
          year: period.year,
          month: period.month,
          amountCad,
        },
        update: { amountCad },
      });
    }),
  );
}

function partitionMatchedUnmatched(lines: NormalizedBillingLine[], accountMap: Map<string, string>) {
  const matched: Array<NormalizedBillingLine & { licencePlate: string }> = [];
  const unmatched: NormalizedBillingLine[] = [];

  for (const line of lines) {
    const licencePlate = accountMap.get(accountJoinKey(line.provider, line.accountIdentifier));
    if (licencePlate) {
      matched.push({ ...line, licencePlate });
    } else {
      unmatched.push(line);
    }
  }

  return { matched, unmatched };
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

  // Point superseded rows at a new row for the run (audit trail of replacement).
  if (existing.length > 0 && marker) {
    await prisma.actualSpend.updateMany({
      where: { id: { in: existing.map((e) => e.id) } },
      data: { supersededBy: marker.id },
    });
  } else if (existing.length > 0) {
    // Period cleared (no matched lines): mark prior as superseded by a sentinel run marker via soft clear.
    await prisma.actualSpend.updateMany({
      where: { id: { in: existing.map((e) => e.id) } },
      data: { supersededBy: runId },
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
  await Promise.all(
    plan.toUpdate.map((row) =>
      prisma.unmatchedBillingLine.update({
        where: { id: row.id },
        data: { amountCad: row.amountCad, ingestionRunId: runId },
      }),
    ),
  );
}

/**
 * Idempotent month ingest: supersede prior active lines for the provider/period (scoped),
 * write new lines, refresh rollups, evaluate flags.
 */
function ingestLockKey(provider: Provider, period: BillingPeriod) {
  return `${provider}:${period.year}-${period.month}`;
}

async function releaseIngestLock(runId: string, data: Prisma.IngestionRunUpdateInput) {
  await prisma.ingestionRun.update({
    where: { id: runId },
    data: { ...data, ingestLockKey: null },
  });
}

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

export async function ingestBillingPeriod(options: IngestOptions): Promise<IngestResult> {
  const { provider, period, triggeredBy } = options;
  const source = resolveBillingSource(provider, options.source);
  const { periodStart, periodEnd } = periodBounds(period);
  const isScoped = Boolean(options.scope?.licencePlates?.length || options.scope?.accountIdentifiers?.length);

  let run: { id: string };
  try {
    run = await prisma.ingestionRun.create({
      data: {
        provider,
        periodStart,
        periodEnd,
        status: FinanceIngestionStatus.RUNNING,
        triggeredBy,
        ingestLockKey: ingestLockKey(provider, period),
        isScoped,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`Ingest already running for ${provider} ${period.year}-${period.month}`);
    }
    throw error;
  }

  try {
    const products = await loadProductsForAccountMap();
    const { map: accountMap, collisions } = buildAccountToLicencePlateMap(products);
    if (collisions.length > 0) {
      logger.warn('Duplicate billing account links omitted from ingest join', { collisions });
    }

    const scope: BillingFetchScope | undefined = options.scope?.licencePlates?.length
      ? {
          ...options.scope,
          accountIdentifiers: [
            ...new Set([
              ...(options.scope.accountIdentifiers ?? []),
              ...accountIdentifiersForPlates(products, options.scope.licencePlates),
            ]),
          ],
        }
      : options.scope;

    let lines = await source.fetchBillingLines(period, scope);
    lines = lines.filter((line) => line.provider === provider);

    if (scope?.accountIdentifiers?.length) {
      const allowed = new Set(scope.accountIdentifiers.map((id) => id.toLowerCase()));
      lines = lines.filter((line) => allowed.has(line.accountIdentifier.toLowerCase()));
    }

    const { matched, unmatched } = partitionMatchedUnmatched(lines, accountMap);
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

    await releaseIngestLock(run.id, {
      status: FinanceIngestionStatus.SUCCESS,
      completedAt: new Date(),
      rowsLoaded: matched.length,
      rowsUnmatched: unmatched.length,
    });

    return {
      runId: run.id,
      rowsLoaded: matched.length,
      rowsUnmatched: unmatched.length,
      flagsRaised,
      status: FinanceIngestionStatus.SUCCESS,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await releaseIngestLock(run.id, {
      status: FinanceIngestionStatus.FAILED,
      completedAt: new Date(),
      errorMessage: message.slice(0, 2000),
    });
    throw error;
  }
}

/** Ingest Apr–current month (or through July for stable demos) for all providers via simulated/real source. */
export async function ingestFiscalYearToDate(options: {
  triggeredBy: string;
  throughMonth?: { year: number; month: number };
  source?: BillingSource;
  scope?: BillingFetchScope;
  providers?: Provider[];
}) {
  const now = new Date();
  const through = options.throughMonth ?? { year: now.getFullYear(), month: now.getMonth() + 1 };
  const fyStartYear = through.month >= 4 ? through.year : through.year - 1;

  const periods: BillingPeriod[] = [];
  for (let month = 4; month <= 12; month += 1) {
    periods.push({ year: fyStartYear, month });
    if (fyStartYear === through.year && month >= through.month) break;
  }
  if (through.year > fyStartYear) {
    for (let month = 1; month <= through.month; month += 1) {
      periods.push({ year: through.year, month });
    }
  }

  const providers = options.providers ?? [Provider.AWS, Provider.AWS_LZA, Provider.AZURE];
  const results: IngestResult[] = [];
  for (const period of periods) {
    for (const provider of providers) {
      results.push(
        await ingestBillingPeriod({
          provider,
          period,
          triggeredBy: options.triggeredBy,
          source: options.source,
          scope: options.scope,
        }),
      );
    }
  }
  return results;
}
