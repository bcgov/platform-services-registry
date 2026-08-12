import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Provider, ProjectStatus } from '@/prisma/client';
import { activeActualSpendWhere } from '../active-spend';
import { buildAccountToLicencePlateMap } from '../billing-account-links';
import { defaultFinanceBillingSource } from '../constants';
import { evaluateSpendFlagsForPeriod } from './evaluate-flags';
import { createAwsBillingSource, createAzureBillingSource } from './real-sources';
import { createSimulatedBillingSource } from './simulated-source';
import type { BillingFetchScope, BillingPeriod, BillingSource, NormalizedBillingLine } from './types';

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

async function loadAccountMap(scope?: BillingFetchScope) {
  const products = await prisma.publicCloudProduct.findMany({
    where: {
      status: ProjectStatus.ACTIVE,
      ...(scope?.licencePlates?.length ? { licencePlate: { in: scope.licencePlates } } : {}),
    },
    select: {
      licencePlate: true,
      provider: true,
      billingAccountLinks: true,
      awsAccounts: true,
      azureSubscriptions: true,
    },
  });
  return buildAccountToLicencePlateMap(products);
}

async function refreshRollupsForPeriod(provider: Provider, period: BillingPeriod, licencePlates: string[]) {
  const plates = [...new Set(licencePlates)];
  for (const licencePlate of plates) {
    const sum = await prisma.actualSpend.aggregate({
      where: {
        AND: [
          activeActualSpendWhere,
          {
            licencePlate,
            provider,
            year: period.year,
            month: period.month,
          },
        ],
      },
      _sum: { amountCad: true },
    });
    const amountCad = sum._sum.amountCad ?? 0;
    const existingRollup = await prisma.monthlyProductSpendRollup.findFirst({
      where: { licencePlate, provider, year: period.year, month: period.month },
    });
    if (existingRollup) {
      await prisma.monthlyProductSpendRollup.update({
        where: { id: existingRollup.id },
        data: { amountCad },
      });
    } else {
      await prisma.monthlyProductSpendRollup.create({
        data: {
          licencePlate,
          provider,
          year: period.year,
          month: period.month,
          amountCad,
        },
      });
    }
  }
}

function partitionMatchedUnmatched(lines: NormalizedBillingLine[], accountMap: Map<string, string>) {
  const matched: Array<NormalizedBillingLine & { licencePlate: string }> = [];
  const unmatched: NormalizedBillingLine[] = [];

  for (const line of lines) {
    const licencePlate = accountMap.get(`${line.provider}:${line.accountIdentifier}`);
    if (licencePlate) {
      matched.push({ ...line, licencePlate });
    } else {
      unmatched.push(line);
    }
  }

  return { matched, unmatched };
}

function resolveSupersedeLicencePlateFilter(
  matchedPlates: string[],
  scope?: BillingFetchScope,
): { licencePlate: { in: string[] } } | Record<string, never> {
  if (matchedPlates.length && scope?.licencePlates?.length) {
    return { licencePlate: { in: matchedPlates } };
  }
  if (scope?.licencePlates?.length) {
    return { licencePlate: { in: scope.licencePlates } };
  }
  return {};
}

async function resolveRollupPlates(
  provider: Provider,
  matchedPlates: string[],
  scope?: BillingFetchScope,
): Promise<string[]> {
  if (matchedPlates.length > 0) return matchedPlates;
  if (scope?.licencePlates?.length) return scope.licencePlates;

  const products = await prisma.publicCloudProduct.findMany({
    where: { status: ProjectStatus.ACTIVE, provider },
    select: { licencePlate: true },
  });
  return products.map((p) => p.licencePlate);
}

async function writeMatchedAndSupersede(options: {
  provider: Provider;
  period: BillingPeriod;
  runId: string;
  matched: Array<NormalizedBillingLine & { licencePlate: string }>;
  matchedPlates: string[];
  scope?: BillingFetchScope;
}) {
  const { provider, period, runId, matched, matchedPlates, scope } = options;

  const existing = await prisma.actualSpend.findMany({
    where: {
      AND: [
        activeActualSpendWhere,
        {
          provider,
          year: period.year,
          month: period.month,
          ...resolveSupersedeLicencePlateFilter(matchedPlates, scope),
        },
      ],
    },
    select: { id: true },
  });

  const createdIds: string[] = [];
  for (const line of matched) {
    const created = await prisma.actualSpend.create({
      data: {
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
      },
      select: { id: true },
    });
    createdIds.push(created.id);
  }

  // Point superseded rows at the first new row id for the run (audit trail of replacement).
  if (existing.length > 0 && createdIds[0]) {
    await prisma.actualSpend.updateMany({
      where: { id: { in: existing.map((e) => e.id) } },
      data: { supersededBy: createdIds[0] },
    });
  } else if (existing.length > 0 && createdIds.length === 0) {
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
) {
  // Clear prior unmatched for provider/period that are still unresolved (re-ingest replace).
  await prisma.unmatchedBillingLine.deleteMany({
    where: {
      provider,
      year: period.year,
      month: period.month,
      resolvedTo: null,
    },
  });

  if (unmatched.length > 0) {
    await prisma.unmatchedBillingLine.createMany({
      data: unmatched.map((line) => ({
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
}

/**
 * Idempotent month ingest: supersede prior active lines for the provider/period (scoped),
 * write new lines, refresh rollups, evaluate flags.
 */
export async function ingestBillingPeriod(options: IngestOptions): Promise<IngestResult> {
  const { provider, period, triggeredBy, scope } = options;
  const source = resolveBillingSource(provider, options.source);
  const { periodStart, periodEnd } = periodBounds(period);

  const run = await prisma.ingestionRun.create({
    data: {
      provider,
      periodStart,
      periodEnd,
      status: FinanceIngestionStatus.RUNNING,
      triggeredBy,
    },
  });

  try {
    const accountMap = await loadAccountMap(scope);
    let lines = await source.fetchBillingLines(period, scope);
    lines = lines.filter((line) => line.provider === provider);

    if (scope?.accountIdentifiers?.length) {
      const allowed = new Set(scope.accountIdentifiers);
      lines = lines.filter((line) => allowed.has(line.accountIdentifier));
    }

    const { matched, unmatched } = partitionMatchedUnmatched(lines, accountMap);
    const matchedPlates = [...new Set(matched.map((m) => m.licencePlate))];

    await writeMatchedAndSupersede({
      provider,
      period,
      runId: run.id,
      matched,
      matchedPlates,
      scope,
    });
    await writeUnmatched(provider, period, run.id, unmatched);

    const rollupPlates = await resolveRollupPlates(provider, matchedPlates, scope);
    await refreshRollupsForPeriod(provider, period, rollupPlates);
    const flagsRaised = await evaluateSpendFlagsForPeriod(period);

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
    const message = error instanceof Error ? error.message : String(error);
    await prisma.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: FinanceIngestionStatus.FAILED,
        completedAt: new Date(),
        errorMessage: message.slice(0, 2000),
      },
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
