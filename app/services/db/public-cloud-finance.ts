import {
  calculateVariance,
  countMissingRequiredHorizonMonths,
  currentFiscalYearBounds,
  fiscalYearMonths,
  hasForecastValuesForRequiredHorizon,
  isCurrentCalendarMonth,
  isLowForecastCoverage,
  lastCompleteMonth,
  monthKey,
  sumForecastForFiscalYear,
  yearOverYearChange,
} from '@/components/public-cloud/finance/finance-measure-utils';
import { type MonthlyValue } from '@/components/public-cloud/forecast/forecast-grid-utils';
import prisma from '@/core/prisma';
import { FinanceIngestionStatus, Provider, ProjectStatus } from '@/prisma/client';
import { activeActualSpendWhere } from '@/services/public-cloud-finance/active-spend';
import { FINANCE_ANOMALY_THRESHOLDS, SPEND_FLAG_RULE_LABELS } from '@/services/public-cloud-finance/constants';

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
  rollups: Array<{ year: number; month: number }>;
  complete: { year: number; month: number };
}) {
  const { fyMonths, products, forecastByPlate, actualByPlateMonth, rollups, complete } = options;

  const forecastByPlateMonth = new Map<string, number>();
  for (const product of products) {
    const values = forecastByPlate.get(product.licencePlate);
    if (!values) continue;
    for (const value of values) {
      forecastByPlateMonth.set(`${product.licencePlate}:${monthKey(value.year, value.month)}`, value.amount);
    }
  }

  const monthsWithActuals = new Set(rollups.map((row) => monthKey(row.year, row.month)));

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
      actual: monthsWithActuals.has(keySuffix) ? actualTotal : null,
      forecast: forecastTotal,
      isElapsed: m.year < complete.year || (m.year === complete.year && m.month <= complete.month),
      isCurrentPartial: isCurrentCalendarMonth(m.year, m.month),
    };
  });
}

export async function getDataFreshness() {
  const providers = [Provider.AWS, Provider.AWS_LZA, Provider.AZURE] as const;
  const result: Array<{ provider: Provider; completedAt: string | null; status: FinanceIngestionStatus | null }> = [];
  for (const provider of providers) {
    const run = await prisma.ingestionRun.findFirst({
      where: { provider, status: FinanceIngestionStatus.SUCCESS },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true, status: true },
    });
    result.push({
      provider,
      completedAt: run?.completedAt?.toISOString() ?? null,
      status: run?.status ?? null,
    });
  }
  return result;
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
  let fytdActual = 0;

  for (const row of rollups) {
    const key = `${row.licencePlate}:${monthKey(row.year, row.month)}`;
    actualByPlateMonth.set(key, (actualByPlateMonth.get(key) ?? 0) + row.amountCad);
    const inYtd = ytdMonths.some((m) => m.year === row.year && m.month === row.month);
    if (inYtd) fytdActual += row.amountCad;
  }

  // Service-line totals from active lines for current FY YTD
  const serviceLines = await prisma.actualSpend.groupBy({
    by: ['serviceLine'],
    where: {
      AND: [
        activeActualSpendWhere,
        { licencePlate: { in: plates } },
        { OR: ytdMonths.map((m) => ({ year: m.year, month: m.month })) },
        provider === 'ALL' ? {} : { provider },
      ],
    },
    _sum: { amountCad: true },
    orderBy: { _sum: { amountCad: 'desc' } },
    take: 5,
  });

  const {
    fullYearForecast,
    productsWithForecast,
    productsWithCompleteCoverage,
    excludedFromForecastTotals,
    productActualYtd,
  } = accumulateProductForecastTotals(products, forecastByPlate, fy.startYear, ytdMonths, actualByPlateMonth);

  const coveragePercent =
    products.length === 0 ? 0 : Math.round((productsWithCompleteCoverage / products.length) * 1000) / 10;
  const lowCoverage = isLowForecastCoverage(coveragePercent);
  const variance = lowCoverage ? null : calculateVariance(fytdActual, fullYearForecast);

  const monthlyChart = buildMonthlyChart({
    fyMonths,
    products,
    forecastByPlate,
    actualByPlateMonth,
    rollups,
    complete,
  });

  const topProducts = [...products]
    .map((p) => ({
      licencePlate: p.licencePlate,
      name: p.name,
      provider: p.provider,
      status: p.status,
      organizationName: p.organization.name,
      amountCad: productActualYtd.get(p.licencePlate) ?? 0,
    }))
    .sort((a, b) => b.amountCad - a.amountCad)
    .slice(0, 5);

  const topServiceLines = serviceLines.map((s) => ({
    serviceLine: s.serviceLine,
    amountCad: s._sum.amountCad ?? 0,
  }));

  const [anomaliesAwaitingReview, unmatchedThisMonth, productsMissingForecast] = await Promise.all([
    prisma.spendFlag.count({ where: { reviewedAt: null } }),
    prisma.unmatchedBillingLine.count({
      where: {
        year: complete.year,
        month: complete.month,
        resolvedTo: null,
        ...(provider === 'ALL' ? {} : { provider }),
      },
    }),
    Promise.resolve(excludedFromForecastTotals),
  ]);

  const freshness = await getDataFreshness();

  return {
    fiscalYearLabel: fy.label,
    fytdActual,
    fullYearForecast,
    variance,
    lowCoverage,
    coverage: {
      percent: coveragePercent,
      completeCount: productsWithCompleteCoverage,
      productCount: products.length,
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
  const months =
    options.period === 'full-fy'
      ? fyMonths
      : fyMonths.filter((m) => m.year < complete.year || (m.year === complete.year && m.month <= complete.month));

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

  const rollups = await prisma.monthlyProductSpendRollup.findMany({
    where: {
      licencePlate: { in: plates },
      OR: months.map((m) => ({ year: m.year, month: m.month })),
      ...(provider === 'ALL' ? {} : { provider }),
    },
  });

  const priorYearMonths = months.map((m) => ({ year: m.year - 1, month: m.month }));
  const priorRollups = await prisma.monthlyProductSpendRollup.findMany({
    where: {
      licencePlate: { in: plates },
      OR: priorYearMonths.map((m) => ({ year: m.year, month: m.month })),
      ...(provider === 'ALL' ? {} : { provider }),
    },
  });

  const amountByPlate = new Map<string, number>();
  const priorByPlate = new Map<string, number>();
  for (const row of rollups) {
    amountByPlate.set(row.licencePlate, (amountByPlate.get(row.licencePlate) ?? 0) + row.amountCad);
  }
  for (const row of priorRollups) {
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

  const serviceGroups = await prisma.actualSpend.groupBy({
    by: ['serviceLine'],
    where: {
      AND: [
        activeActualSpendWhere,
        { licencePlate: { in: plates } },
        { OR: months.map((m) => ({ year: m.year, month: m.month })) },
        provider === 'ALL' ? {} : { provider },
      ],
    },
    _sum: { amountCad: true },
    orderBy: { _sum: { amountCad: 'desc' } },
    take: limit,
  });

  const priorServiceGroups = await prisma.actualSpend.groupBy({
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

  const serviceRows = serviceGroups.map((s, index) => {
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
    where: options?.includeReviewed ? {} : { reviewedAt: null },
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
  return prisma.spendFlag.update({
    where: { id },
    data: {
      reviewedBy: reviewerIdir,
      reviewedAt: new Date(),
      reviewNote,
    },
  });
}

export async function getUnmatchedBilling(options?: { provider?: ProviderFilter; year?: number; month?: number }) {
  const complete = lastCompleteMonth();
  const year = options?.year ?? complete.year;
  const month = options?.month ?? complete.month;
  const provider = options?.provider ?? 'ALL';

  const lines = await prisma.unmatchedBillingLine.findMany({
    where: {
      year,
      month,
      ...(provider === 'ALL' ? {} : { provider }),
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

export async function resolveUnmatchedBillingLine(id: string, licencePlate: string) {
  return prisma.unmatchedBillingLine.update({
    where: { id },
    data: { resolvedTo: licencePlate, resolvedAt: new Date() },
  });
}

export async function getProductActuals(licencePlate: string) {
  const rollups = await prisma.monthlyProductSpendRollup.findMany({
    where: { licencePlate },
  });
  const byMonth = new Map<string, number>();
  for (const row of rollups) {
    const key = monthKey(row.year, row.month);
    byMonth.set(key, (byMonth.get(key) ?? 0) + row.amountCad);
  }
  return [...byMonth.entries()].map(([key, amountCad]) => {
    const [year, month] = key.split('-').map(Number);
    return { year, month, amountCad };
  });
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
