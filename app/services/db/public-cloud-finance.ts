import {
  buildIngestionFreshness,
  calculateVariance,
  countMissingRequiredHorizonMonths,
  currentFiscalYearBounds,
  fiscalYearMonths,
  hasForecastValuesForRequiredHorizon,
  isCurrentCalendarMonth,
  isLowForecastCoverage,
  lastCompleteMonth,
  likeForLikeMonths,
  monthKey,
  sumForecastForFiscalYear,
  sumForecastForMonths,
  summarizeYtdActuals,
  yearOverYearChange,
  productExistedDuringMonth,
} from '@/components/public-cloud/finance/finance-measure-utils';
import { type MonthlyValue } from '@/components/public-cloud/forecast/forecast-grid-utils';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Prisma, Provider, ProjectStatus } from '@/prisma/client';
import {
  activeActualSpendWhere,
  unresolvedUnmatchedWhere,
  unreviewedSpendFlagWhere,
} from '@/services/public-cloud-finance/active-spend';
import { normalizeBillingAccountLinks } from '@/services/public-cloud-finance/billing-account-links';
import { FINANCE_ANOMALY_THRESHOLDS, SPEND_FLAG_RULE_LABELS } from '@/services/public-cloud-finance/constants';
import { evaluateSpendFlagsForPeriod } from '@/services/public-cloud-finance/ingest/evaluate-flags';
import { loadProductBillingStartByPlate } from '@/services/public-cloud-finance/product-billing-start';

export type ProviderFilter = 'ALL' | Provider;

function providerWhere(provider: ProviderFilter) {
  return provider === 'ALL' ? {} : { provider };
}

type SnapshotProduct = {
  licencePlate: string;
  name: string;
  provider: Provider;
  status: ProjectStatus;
  organization: { code: string; name: string };
};

function accumulateProductForecastTotals(
  products: SnapshotProduct[],
  forecastByPlate: Map<string, MonthlyValue[]>,
  fyStartYear: number,
  ytdMonths: Array<{ year: number; month: number }>,
  actualByPlateMonth: Map<string, number>,
) {
  let fullYearForecast = 0;
  let fytdForecast = 0;
  let productsWithForecast = 0;
  let productsWithCompleteCoverage = 0;
  let excludedFromForecastTotals = 0;
  const productActualYtd = new Map<string, number>();

  for (const product of products) {
    const forecast = forecastByPlate.get(product.licencePlate);
    if (!forecast) {
      excludedFromForecastTotals += 1;
    } else {
      productsWithForecast += 1;
      fullYearForecast += sumForecastForFiscalYear(forecast, fyStartYear);
      fytdForecast += sumForecastForMonths(forecast, ytdMonths);
      if (hasForecastValuesForRequiredHorizon(forecast)) productsWithCompleteCoverage += 1;
    }

    let ytd = 0;
    for (const m of ytdMonths) {
      ytd += actualByPlateMonth.get(`${product.licencePlate}:${monthKey(m.year, m.month)}`) ?? 0;
    }
    productActualYtd.set(product.licencePlate, ytd);
  }

  return {
    fullYearForecast,
    fytdForecast,
    productsWithForecast,
    productsWithCompleteCoverage,
    excludedFromForecastTotals,
    productActualYtd,
  };
}

function buildMonthlyChart(options: {
  fyMonths: Array<{ year: number; month: number }>;
  products: SnapshotProduct[];
  forecastByPlate: Map<string, MonthlyValue[]>;
  actualByPlateMonth: Map<string, number>;
  complete: { year: number; month: number };
  completeMonthKeys: Set<string>;
}) {
  const { fyMonths, products, forecastByPlate, actualByPlateMonth, complete, completeMonthKeys } = options;

  const forecastByPlateMonth = new Map<string, number>();
  for (const product of products) {
    const values = forecastByPlate.get(product.licencePlate);
    if (!values) continue;
    for (const value of values) {
      forecastByPlateMonth.set(`${product.licencePlate}:${monthKey(value.year, value.month)}`, value.amount);
    }
  }

  return fyMonths.map((m) => {
    const keySuffix = monthKey(m.year, m.month);
    const forecastTotal = products.reduce(
      (sum, product) => sum + (forecastByPlateMonth.get(`${product.licencePlate}:${keySuffix}`) ?? 0),
      0,
    );
    const actualTotal = products.reduce(
      (sum, product) => sum + (actualByPlateMonth.get(`${product.licencePlate}:${keySuffix}`) ?? 0),
      0,
    );

    return {
      year: m.year,
      month: m.month,
      label: new Date(m.year, m.month - 1, 1).toLocaleString('en-CA', { month: 'short' }),
      actual: completeMonthKeys.has(keySuffix) ? actualTotal : null,
      forecast: forecastTotal,
      isElapsed: m.year < complete.year || (m.year === complete.year && m.month <= complete.month),
      isCurrentPartial: isCurrentCalendarMonth(m.year, m.month),
    };
  });
}

export async function getDataFreshness() {
  const providers = [Provider.AWS, Provider.AWS_LZA, Provider.AZURE] as const;
  return Promise.all(
    providers.map(async (provider) => {
      const [latest, lastSuccess] = await Promise.all([
        prisma.ingestionRun.findFirst({
          where: { provider },
          orderBy: { startedAt: 'desc' },
          select: { status: true, completedAt: true, errorMessage: true },
        }),
        prisma.ingestionRun.findFirst({
          where: { provider, status: FinanceIngestionStatus.SUCCESS },
          orderBy: { completedAt: 'desc' },
          select: { completedAt: true },
        }),
      ]);
      return buildIngestionFreshness(provider, latest, lastSuccess?.completedAt ?? null);
    }),
  );
}

export async function getFinanceSnapshot(provider: ProviderFilter = 'ALL') {
  const fy = currentFiscalYearBounds();
  const complete = lastCompleteMonth();
  // Include ACTIVE and INACTIVE so archived products keep historical FY actuals/forecasts.
  const products = await prisma.publicCloudProduct.findMany({
    where: { ...providerWhere(provider) },
    select: {
      licencePlate: true,
      name: true,
      provider: true,
      status: true,
      organization: { select: { code: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });
  const plates = products.map((p) => p.licencePlate);

  const forecasts = await prisma.cloudCostForecast.findMany({
    where: { licencePlate: { in: plates } },
    select: { licencePlate: true, monthlyValues: true },
  });
  const forecastByPlate = new Map(forecasts.map((f) => [f.licencePlate, f.monthlyValues as MonthlyValue[]]));

  const fyMonths = fiscalYearMonths(fy.startYear);
  const ytdMonths = fyMonths.filter(
    (m) => m.year < complete.year || (m.year === complete.year && m.month <= complete.month),
  );

  const rollups = await prisma.monthlyProductSpendRollup.findMany({
    where: {
      licencePlate: { in: plates },
      OR: fyMonths.map((m) => ({ year: m.year, month: m.month })),
      ...(provider === 'ALL' ? {} : { provider }),
    },
  });

  const actualByPlateMonth = new Map<string, number>();
  for (const row of rollups) {
    const key = `${row.licencePlate}:${monthKey(row.year, row.month)}`;
    actualByPlateMonth.set(key, (actualByPlateMonth.get(key) ?? 0) + row.amountCad);
  }
  const billingStartedByPlate = await loadProductBillingStartByPlate(plates);
  const { expectedMonths: expectedYtdMonths, completeMonths: completeYtdMonths } = likeForLikeMonths(
    ytdMonths,
    products,
    billingStartedByPlate,
    rollups,
  );
  const completeMonthKeys = new Set(completeYtdMonths.map((month) => monthKey(month.year, month.month)));
  const { fytdActual } = summarizeYtdActuals(completeYtdMonths, rollups);
  const presentMonths = completeYtdMonths.length;
  const expectedMonths = expectedYtdMonths.length;

  const serviceLines =
    completeYtdMonths.length === 0
      ? []
      : await prisma.actualSpend.groupBy({
          by: ['serviceLine'],
          where: {
            AND: [
              activeActualSpendWhere,
              { licencePlate: { in: plates } },
              { OR: completeYtdMonths.map((m) => ({ year: m.year, month: m.month })) },
              provider === 'ALL' ? {} : { provider },
            ],
          },
          _sum: { amountCad: true },
          orderBy: { _sum: { amountCad: 'desc' } },
          take: 5,
        });

  const { fullYearForecast, fytdForecast, productsWithForecast, excludedFromForecastTotals } =
    accumulateProductForecastTotals(products, forecastByPlate, fy.startYear, completeYtdMonths, actualByPlateMonth);

  const activeProducts = products.filter((product) => product.status === ProjectStatus.ACTIVE);
  const activeComplete = activeProducts.filter((product) => {
    const forecast = forecastByPlate.get(product.licencePlate);
    return forecast ? hasForecastValuesForRequiredHorizon(forecast) : false;
  }).length;
  const coveragePercent =
    activeProducts.length === 0 ? 0 : Math.round((activeComplete / activeProducts.length) * 1000) / 10;
  const lowCoverage = isLowForecastCoverage(coveragePercent);
  const actualsIncomplete = presentMonths < expectedMonths;
  const fytdVariance = lowCoverage || actualsIncomplete ? null : calculateVariance(fytdActual, fytdForecast);

  const monthlyChart = buildMonthlyChart({
    fyMonths,
    products,
    forecastByPlate,
    actualByPlateMonth,
    complete,
    completeMonthKeys,
  });

  const topProducts = [...products]
    .map((p) => ({
      licencePlate: p.licencePlate,
      name: p.name,
      provider: p.provider,
      status: p.status,
      organizationName: p.organization.name,
      amountCad: completeYtdMonths
        .filter((month) => {
          const startedAt = billingStartedByPlate.get(p.licencePlate);
          return startedAt ? productExistedDuringMonth(startedAt, month.year, month.month) : false;
        })
        .reduce(
          (sum, month) => sum + (actualByPlateMonth.get(`${p.licencePlate}:${monthKey(month.year, month.month)}`) ?? 0),
          0,
        ),
    }))
    .sort((a, b) => b.amountCad - a.amountCad)
    .slice(0, 5);

  const topServiceLines = serviceLines.map((s) => ({
    serviceLine: s.serviceLine,
    amountCad: s._sum.amountCad ?? 0,
  }));

  const [anomaliesAwaitingReview, unmatchedThisMonth, productsMissingForecast] = await Promise.all([
    prisma.spendFlag.count({
      where: { AND: [unreviewedSpendFlagWhere, provider === 'ALL' ? {} : { provider }] },
    }),
    prisma.unmatchedBillingLine.count({
      where: {
        year: complete.year,
        month: complete.month,
        AND: [unresolvedUnmatchedWhere],
        ...(provider === 'ALL' ? {} : { provider }),
      },
    }),
    Promise.resolve(excludedFromForecastTotals),
  ]);

  const freshness = await getDataFreshness();

  return {
    fiscalYearLabel: fy.label,
    fytdActual,
    actualsCoverage: { presentMonths, expectedMonths, elapsedMonths: ytdMonths.length },
    fytdForecast,
    /** FYTD actual vs FYTD forecast (same elapsed months through lastCompleteMonth). */
    fytdVariance,
    /** Alias of fytdVariance for export consumers. */
    variance: fytdVariance,
    fullYearForecast,
    lowCoverage,
    coverage: {
      percent: coveragePercent,
      completeCount: activeComplete,
      productCount: activeProducts.length,
      withForecastCount: productsWithForecast,
      excludedFromForecastTotals,
    },
    monthlyChart,
    topProducts,
    topServiceLines,
    counts: {
      anomaliesAwaitingReview,
      productsMissingForecast,
      unmatchedThisMonth,
    },
    freshness,
    lastCompleteMonth: complete,
  };
}

export async function getFinanceRankings(options: {
  provider?: ProviderFilter;
  organizationId?: string;
  period?: 'ytd' | 'full-fy';
  limit?: number;
}) {
  const provider = options.provider ?? 'ALL';
  const limit = options.limit ?? 10;
  const fy = currentFiscalYearBounds();
  const complete = lastCompleteMonth();
  const fyMonths = fiscalYearMonths(fy.startYear);
  const ytdMonths = fyMonths.filter(
    (m) => m.year < complete.year || (m.year === complete.year && m.month <= complete.month),
  );
  const fyComplete = complete.year > fy.startYear + 1 || (complete.year === fy.startYear + 1 && complete.month >= 3);
  const months = options.period === 'full-fy' && fyComplete ? fyMonths : ytdMonths;

  // Include ACTIVE and INACTIVE so archived products remain in historical rankings/totals.
  const products = await prisma.publicCloudProduct.findMany({
    where: {
      ...providerWhere(provider),
      ...(options.organizationId ? { organizationId: options.organizationId } : {}),
    },
    select: {
      licencePlate: true,
      name: true,
      provider: true,
      status: true,
      organization: { select: { id: true, code: true, name: true } },
    },
  });
  const plates = products.map((p) => p.licencePlate);

  const rollups =
    months.length === 0
      ? []
      : await prisma.monthlyProductSpendRollup.findMany({
          where: {
            licencePlate: { in: plates },
            OR: months.map((m) => ({ year: m.year, month: m.month })),
            ...(provider === 'ALL' ? {} : { provider }),
          },
        });

  const billingStartedByPlate = await loadProductBillingStartByPlate(plates);
  const { completeMonths } = likeForLikeMonths(months, products, billingStartedByPlate, rollups);
  const completeMonthKeys = new Set(completeMonths.map((month) => monthKey(month.year, month.month)));
  const priorYearMonths = completeMonths.map((m) => ({ year: m.year - 1, month: m.month }));
  const priorRollups =
    priorYearMonths.length === 0
      ? []
      : await prisma.monthlyProductSpendRollup.findMany({
          where: {
            licencePlate: { in: plates },
            OR: priorYearMonths.map((m) => ({ year: m.year, month: m.month })),
            ...(provider === 'ALL' ? {} : { provider }),
          },
        });

  const amountByPlate = new Map<string, number>();
  const priorByPlate = new Map<string, number>();
  for (const row of rollups) {
    if (!completeMonthKeys.has(monthKey(row.year, row.month))) continue;
    const startedAt = billingStartedByPlate.get(row.licencePlate);
    if (startedAt && !productExistedDuringMonth(startedAt, row.year, row.month)) continue;
    amountByPlate.set(row.licencePlate, (amountByPlate.get(row.licencePlate) ?? 0) + row.amountCad);
  }
  for (const row of priorRollups) {
    const startedAt = billingStartedByPlate.get(row.licencePlate);
    if (startedAt && !productExistedDuringMonth(startedAt, row.year, row.month)) continue;
    priorByPlate.set(row.licencePlate, (priorByPlate.get(row.licencePlate) ?? 0) + row.amountCad);
  }

  const productTotal = [...amountByPlate.values()].reduce((a, b) => a + b, 0);
  const productRows = products
    .map((p) => {
      const amountCad = amountByPlate.get(p.licencePlate) ?? 0;
      return {
        licencePlate: p.licencePlate,
        name: p.name,
        provider: p.provider,
        status: p.status,
        organizationName: p.organization.name,
        amountCad,
        shareOfTotal: productTotal > 0 ? amountCad / productTotal : 0,
        yoyChangePercent: yearOverYearChange(amountCad, priorByPlate.get(p.licencePlate) ?? null),
      };
    })
    .sort((a, b) => b.amountCad - a.amountCad)
    .slice(0, limit)
    .map((row, index) => ({ rank: index + 1, ...row }));

  const serviceGroups =
    completeMonths.length === 0
      ? []
      : await prisma.actualSpend.groupBy({
          by: ['serviceLine'],
          where: {
            AND: [
              activeActualSpendWhere,
              { licencePlate: { in: plates } },
              { OR: completeMonths.map((m) => ({ year: m.year, month: m.month })) },
              provider === 'ALL' ? {} : { provider },
            ],
          },
          _sum: { amountCad: true },
          orderBy: { _sum: { amountCad: 'desc' } },
        });

  const priorServiceGroups =
    priorYearMonths.length === 0
      ? []
      : await prisma.actualSpend.groupBy({
          by: ['serviceLine'],
          where: {
            AND: [
              activeActualSpendWhere,
              { licencePlate: { in: plates } },
              { OR: priorYearMonths.map((m) => ({ year: m.year, month: m.month })) },
              provider === 'ALL' ? {} : { provider },
            ],
          },
          _sum: { amountCad: true },
        });
  const priorService = new Map(priorServiceGroups.map((s) => [s.serviceLine, s._sum.amountCad ?? 0]));
  const serviceTotal = serviceGroups.reduce((sum, s) => sum + (s._sum.amountCad ?? 0), 0);

  const serviceRows = serviceGroups.slice(0, limit).map((s, index) => {
    const amountCad = s._sum.amountCad ?? 0;
    return {
      rank: index + 1,
      serviceLine: s.serviceLine,
      amountCad,
      shareOfTotal: serviceTotal > 0 ? amountCad / serviceTotal : 0,
      yoyChangePercent: yearOverYearChange(amountCad, priorService.get(s.serviceLine) ?? null),
    };
  });

  return {
    fiscalYearLabel: fy.label,
    period: options.period ?? 'ytd',
    filteredTotalCad: productTotal,
    products: productRows,
    serviceLines: serviceRows,
  };
}

export async function getForecastCoverageChaseList() {
  // Chase list is ACTIVE-only: do not remind owners of archived products.
  const products = await prisma.publicCloudProduct.findMany({
    where: { status: ProjectStatus.ACTIVE },
    select: {
      licencePlate: true,
      name: true,
      provider: true,
      projectOwner: { select: { firstName: true, lastName: true, email: true } },
      organization: { select: { name: true, code: true } },
    },
    orderBy: { name: 'asc' },
  });
  const forecasts = await prisma.cloudCostForecast.findMany({
    where: { licencePlate: { in: products.map((p) => p.licencePlate) } },
  });
  const byPlate = new Map(forecasts.map((f) => [f.licencePlate, f.monthlyValues as MonthlyValue[]]));

  return products.map((product) => {
    const values = byPlate.get(product.licencePlate);
    let coverageState: 'complete' | 'incomplete' | 'missing' = 'missing';
    let monthsMissing = 24;
    if (values) {
      monthsMissing = countMissingRequiredHorizonMonths(values);
      coverageState = monthsMissing === 0 ? 'complete' : 'incomplete';
    }
    return {
      licencePlate: product.licencePlate,
      name: product.name,
      provider: product.provider,
      organizationName: product.organization.name,
      projectOwnerName:
        `${product.projectOwner.firstName ?? ''} ${product.projectOwner.lastName ?? ''}`.trim() ||
        product.projectOwner.email,
      projectOwnerEmail: product.projectOwner.email,
      coverageState,
      monthsMissing,
      /** Reminder send is out of scope; column reserved for future action. */
      lastReminderSentAt: null as string | null,
    };
  });
}

export async function getAnomalyQueue(options?: { includeReviewed?: boolean }) {
  const flags = await prisma.spendFlag.findMany({
    where: options?.includeReviewed ? {} : unreviewedSpendFlagWhere,
    orderBy: [{ raisedAt: 'desc' }],
  });
  const plates = [...new Set(flags.map((f) => f.licencePlate))];
  const products = await prisma.publicCloudProduct.findMany({
    where: { licencePlate: { in: plates } },
    select: { licencePlate: true, name: true },
  });
  const nameByPlate = new Map(products.map((p) => [p.licencePlate, p.name]));

  return {
    thresholds: FINANCE_ANOMALY_THRESHOLDS,
    ruleLabels: SPEND_FLAG_RULE_LABELS,
    flags: flags.map((flag) => ({
      id: flag.id,
      licencePlate: flag.licencePlate,
      productName: nameByPlate.get(flag.licencePlate) ?? flag.licencePlate,
      provider: flag.provider,
      serviceLine: flag.serviceLine,
      year: flag.year,
      month: flag.month,
      ruleId: flag.ruleId,
      ruleLabel: SPEND_FLAG_RULE_LABELS[flag.ruleId],
      currentAmountCad: flag.currentAmountCad,
      priorAmountCad: flag.priorAmountCad,
      raisedAt: flag.raisedAt.toISOString(),
      reviewedBy: flag.reviewedBy,
      reviewedAt: flag.reviewedAt?.toISOString() ?? null,
      reviewNote: flag.reviewNote,
    })),
  };
}

export async function reviewSpendFlag(id: string, reviewerIdir: string, reviewNote: string) {
  const updated = await prisma.spendFlag.updateMany({
    where: { AND: [{ id }, unreviewedSpendFlagWhere] },
    data: {
      reviewedBy: reviewerIdir,
      reviewedAt: new Date(),
      reviewNote,
    },
  });
  if (updated.count === 0) {
    throw new Error('Flag already reviewed or not found');
  }
  return prisma.spendFlag.findUniqueOrThrow({ where: { id } });
}

export async function getUnmatchedBilling(options?: { provider?: ProviderFilter; year?: number; month?: number }) {
  const complete = lastCompleteMonth();
  const year = options?.year ?? complete.year;
  const month = options?.month ?? complete.month;
  const provider = options?.provider ?? 'ALL';

  const lines = await prisma.unmatchedBillingLine.findMany({
    where: {
      AND: [
        unresolvedUnmatchedWhere,
        {
          year,
          month,
          ...(provider === 'ALL' ? {} : { provider }),
        },
      ],
    },
    orderBy: [{ amountCad: 'desc' }],
  });

  return {
    year,
    month,
    note: 'Lines that cannot be matched to a product via billingAccountLinks (or AWS_LZA awsAccounts / Azure azureSubscriptions fallback). Classic AWS has no native account field.',
    lines: lines.map((line) => ({
      id: line.id,
      provider: line.provider,
      accountIdentifier: line.accountIdentifier,
      serviceLine: line.serviceLine,
      amountCad: line.amountCad,
      resolvedTo: line.resolvedTo,
      resolvedAt: line.resolvedAt?.toISOString() ?? null,
      loadedAt: line.loadedAt.toISOString(),
    })),
  };
}

async function claimUnmatchedLine(id: string, licencePlate: string, alreadyResolvedTo?: string | null) {
  if (alreadyResolvedTo && alreadyResolvedTo !== licencePlate) {
    throw new Error('Unmatched line already resolved');
  }
  if (alreadyResolvedTo === licencePlate) return;

  const claimed = await prisma.unmatchedBillingLine.updateMany({
    where: { id, AND: [unresolvedUnmatchedWhere] },
    data: { resolvedTo: licencePlate, resolvedAt: new Date() },
  });
  if (claimed.count > 0) return;

  const current = await prisma.unmatchedBillingLine.findUnique({ where: { id } });
  if (!current) throw new Error('Unmatched line not found');
  if (current.resolvedTo && current.resolvedTo !== licencePlate) {
    throw new Error('Unmatched line already resolved');
  }
}

async function attachResolvedSpend(options: {
  licencePlate: string;
  provider: Provider;
  serviceLine: string;
  year: number;
  month: number;
  amountCad: number;
  sourceCurrency: string;
  fxRate?: number | null;
  fxRateDate?: Date | null;
  ingestionRunId: string;
}) {
  const attachedWhere = {
    AND: [
      activeActualSpendWhere,
      {
        licencePlate: options.licencePlate,
        provider: options.provider,
        serviceLine: options.serviceLine,
        year: options.year,
        month: options.month,
        ingestionRunId: options.ingestionRunId,
      },
    ],
  };

  let attached = await prisma.actualSpend.findMany({
    where: attachedWhere,
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  if (attached.length === 0) {
    await prisma.actualSpend.create({
      data: {
        licencePlate: options.licencePlate,
        provider: options.provider,
        serviceLine: options.serviceLine,
        year: options.year,
        month: options.month,
        amountCad: options.amountCad,
        sourceCurrency: options.sourceCurrency,
        fxRate: options.fxRate ?? undefined,
        fxRateDate: options.fxRateDate ?? undefined,
        ingestionRunId: options.ingestionRunId,
        supersededBy: null,
      },
    });
    attached = await prisma.actualSpend.findMany({
      where: attachedWhere,
      select: { id: true },
      orderBy: { id: 'asc' },
    });
  }
  if (attached.length > 1) {
    await prisma.actualSpend.updateMany({
      where: { id: { in: attached.slice(1).map((row) => row.id) } },
      data: { supersededBy: attached[0]?.id },
    });
  }
}

export async function resolveUnmatchedBillingLine(id: string, licencePlate: string) {
  const line = await prisma.unmatchedBillingLine.findUnique({ where: { id } });
  if (!line) throw new Error('Unmatched line not found');

  const product = await prisma.publicCloudProduct.findUnique({
    where: { licencePlate },
    select: { licencePlate: true, provider: true, billingAccountLinks: true },
  });
  if (!product) throw new Error('Unknown project identifier');
  if (product.provider !== line.provider) {
    throw new Error('Project provider does not match the unmatched line');
  }

  await claimUnmatchedLine(line.id, licencePlate, line.resolvedTo);

  const links = normalizeBillingAccountLinks(product.billingAccountLinks);
  const alreadyLinked = links.some(
    (link) =>
      link.provider === line.provider && link.accountIdentifier.toLowerCase() === line.accountIdentifier.toLowerCase(),
  );
  if (!alreadyLinked) {
    await prisma.publicCloudProduct.update({
      where: { licencePlate },
      data: {
        billingAccountLinks: [
          ...links,
          { provider: line.provider, accountIdentifier: line.accountIdentifier },
        ] as Prisma.InputJsonValue,
      },
    });
  }

  await attachResolvedSpend({
    licencePlate,
    provider: line.provider,
    serviceLine: line.serviceLine,
    year: line.year,
    month: line.month,
    amountCad: line.amountCad,
    sourceCurrency: line.sourceCurrency,
    fxRate: line.fxRate,
    fxRateDate: line.fxRateDate,
    ingestionRunId: line.ingestionRunId,
  });

  const group = await prisma.actualSpend.aggregate({
    where: {
      AND: [activeActualSpendWhere, { licencePlate, provider: line.provider, year: line.year, month: line.month }],
    },
    _sum: { amountCad: true },
  });
  await prisma.monthlyProductSpendRollup.upsert({
    where: {
      licencePlate_provider_year_month: {
        licencePlate,
        provider: line.provider,
        year: line.year,
        month: line.month,
      },
    },
    create: {
      licencePlate,
      provider: line.provider,
      year: line.year,
      month: line.month,
      amountCad: group._sum.amountCad ?? 0,
    },
    update: { amountCad: group._sum.amountCad ?? 0 },
  });
  await evaluateSpendFlagsForPeriod({ year: line.year, month: line.month });

  return prisma.unmatchedBillingLine.findUniqueOrThrow({ where: { id: line.id } });
}

export async function getProductActuals(licencePlate: string) {
  const [rollups, billingStartedByPlate] = await Promise.all([
    prisma.monthlyProductSpendRollup.findMany({
      where: { licencePlate },
    }),
    loadProductBillingStartByPlate([licencePlate]),
  ]);
  const byMonth = new Map<string, number>();
  for (const row of rollups) {
    const key = monthKey(row.year, row.month);
    byMonth.set(key, (byMonth.get(key) ?? 0) + row.amountCad);
  }
  const months = [...byMonth.entries()].map(([key, amountCad]) => {
    const [year, month] = key.split('-').map(Number);
    return { year, month, amountCad };
  });
  const billingStartedAt = billingStartedByPlate.get(licencePlate)?.toISOString() ?? null;
  return { months, billingStartedAt };
}

export async function listVarianceNotes(licencePlate: string, year?: number, month?: number) {
  return prisma.varianceNote.findMany({
    where: {
      licencePlate,
      ...(year != null && month != null ? { year, month } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createVarianceNote(input: {
  licencePlate: string;
  year: number;
  month: number;
  body: string;
  authorIdir: string;
  supersedesNoteId?: string;
}) {
  if (input.supersedesNoteId) {
    const prior = await prisma.varianceNote.findUnique({ where: { id: input.supersedesNoteId } });
    if (
      !prior ||
      prior.licencePlate !== input.licencePlate ||
      prior.year !== input.year ||
      prior.month !== input.month
    ) {
      throw new Error('supersedesNoteId must refer to a note on the same product and month');
    }
  }

  return prisma.varianceNote.create({
    data: {
      licencePlate: input.licencePlate,
      year: input.year,
      month: input.month,
      body: input.body,
      authorIdir: input.authorIdir,
      supersedesNoteId: input.supersedesNoteId,
    },
  });
}

export { formatCadAmount } from '@/components/public-cloud/finance/finance-measure-utils';
export { SpendFlagRuleId } from '@/prisma/client';
