import {
  buildRollingFiscalForecastMonths,
  formatForecastProviderList,
  getFiscalYearChunks,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
  sumMonthlyValues,
  aggregateMonthlyActualsFromProducts,
  type FiscalYearChunk,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import prisma from '@/core/prisma';
import { Provider, ProjectStatus } from '@/prisma/client';

export async function getProductForecast(licencePlate: string) {
  return prisma.cloudCostForecast.findUnique({ where: { licencePlate } });
}

/** All public-cloud forecasts and platform rollups are reported in CAD. */
export const PROVIDER_FORECAST_CURRENCY: Record<Provider, 'CAD'> = {
  [Provider.AWS]: 'CAD',
  [Provider.AWS_LZA]: 'CAD',
  [Provider.AZURE]: 'CAD',
};

export type PlatformForecastProduct = {
  licencePlate: string;
  name: string;
  provider: Provider;
  status: ProjectStatus;
  currency: 'CAD';
  hasForecast: boolean;
  monthlyTotals: MonthlyValue[];
  /** Parallel to monthlyTotals; null when no ingest rollup for that month. */
  monthlyActuals: Array<number | null>;
  forecastTotal: number;
  actualTotal: number;
};

type CurrencyGroup = {
  currency: 'CAD';
  providers: Set<Provider>;
  productCount: number;
  forecastCount: number;
  totalsByMonth: Map<string, MonthlyValue>;
  products: PlatformForecastProduct[];
};

type ForecastExportRow = Record<string, string | number>;

function alignActualsToHorizon(
  monthlyTotals: MonthlyValue[],
  actualByMonth: Map<string, number>,
): Array<number | null> {
  return monthlyTotals.map((value) => {
    const key = monthKey(value.year, value.month);
    return actualByMonth.has(key) ? actualByMonth.get(key) ?? null : null;
  });
}

function sumKnownActuals(monthlyActuals: Array<number | null>) {
  return monthlyActuals.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
}

function indexRollupsByPlateMonth(
  rollups: Array<{ licencePlate: string; year: number; month: number; amountCad: number }>,
) {
  const actualByPlateMonth = new Map<string, Map<string, number>>();
  for (const row of rollups) {
    let byMonth = actualByPlateMonth.get(row.licencePlate);
    if (!byMonth) {
      byMonth = new Map();
      actualByPlateMonth.set(row.licencePlate, byMonth);
    }
    const key = monthKey(row.year, row.month);
    byMonth.set(key, (byMonth.get(key) ?? 0) + row.amountCad);
  }
  return actualByPlateMonth;
}

function emptyCurrencyGroup(currency: 'CAD'): CurrencyGroup {
  return {
    currency,
    providers: new Set(),
    productCount: 0,
    forecastCount: 0,
    totalsByMonth: new Map(),
    products: [],
  };
}

function addForecastToGroupTotals(group: CurrencyGroup, values: MonthlyValue[]) {
  for (const value of values) {
    const key = monthKey(value.year, value.month);
    const existing = group.totalsByMonth.get(key);
    if (existing) {
      existing.amount += value.amount;
    } else {
      group.totalsByMonth.set(key, {
        year: value.year,
        month: value.month,
        amount: value.amount,
        currency: group.currency,
      });
    }
  }
}

function exportVariance(forecast: number, actual: number | null | undefined) {
  if (actual == null || forecast === 0) return '';
  return actual - forecast;
}

function exportMonthColumns(month: Pick<MonthlyValue, 'year' | 'month'>, fiscalYear: string) {
  return {
    'Fiscal year': fiscalYear,
    Month: shortMonthLabel(month.year, month.month),
    'Month key': `${month.year}-${String(month.month).padStart(2, '0')}`,
  };
}

function appendProductMonthRows(rows: ForecastExportRow[], product: PlatformForecastProduct, fyChunk: FiscalYearChunk) {
  for (let i = 0; i < fyChunk.months.length; i++) {
    const month = fyChunk.months[i];
    const forecast = product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0;
    const actual = product.monthlyActuals[fyChunk.startIndex + i];
    rows.push({
      Level: 'Product',
      'Licence plate': product.licencePlate,
      'Product name': product.name,
      Currency: product.currency,
      Providers: formatForecastProviderList([product.provider]),
      ...exportMonthColumns(month, fyChunk.label),
      Forecast: forecast,
      Actual: actual ?? '',
      Variance: exportVariance(forecast, actual),
    });
  }
}

function appendCurrencyTotalRows(
  rows: ForecastExportRow[],
  group: { currency: 'CAD'; monthlyActuals: Array<number | null> },
  providers: string,
  fyChunk: FiscalYearChunk,
) {
  for (let i = 0; i < fyChunk.months.length; i++) {
    const month = fyChunk.months[i];
    const actual = group.monthlyActuals[fyChunk.startIndex + i];
    rows.push({
      Level: 'Currency total',
      'Licence plate': '',
      'Product name': '',
      Currency: group.currency,
      Providers: providers,
      ...exportMonthColumns(month, fyChunk.label),
      Forecast: month.amount,
      Actual: actual ?? '',
      Variance: exportVariance(month.amount, actual),
    });
  }
}

export async function getPlatformForecastSummary() {
  // Include ACTIVE and INACTIVE so archived products keep historical forecast rollups.
  const products = await prisma.publicCloudProduct.findMany({
    select: { licencePlate: true, name: true, provider: true, status: true },
    orderBy: [{ provider: 'asc' }, { name: 'asc' }],
  });
  const licencePlates = products.map((p) => p.licencePlate);

  const [forecasts, rollups] = await Promise.all([
    prisma.cloudCostForecast.findMany({
      where: { licencePlate: { in: licencePlates } },
      select: { licencePlate: true, monthlyValues: true },
    }),
    prisma.monthlyProductSpendRollup.findMany({
      where: { licencePlate: { in: licencePlates } },
      select: { licencePlate: true, year: true, month: true, amountCad: true },
    }),
  ]);

  const forecastByPlate = new Map(
    forecasts.map((forecast) => [forecast.licencePlate, forecast.monthlyValues as MonthlyValue[]]),
  );
  const actualByPlateMonth = indexRollupsByPlateMonth(rollups);
  const groups = new Map<'CAD', CurrencyGroup>();

  for (const product of products) {
    const currency = PROVIDER_FORECAST_CURRENCY[product.provider];
    let group = groups.get(currency);
    if (!group) {
      group = emptyCurrencyGroup(currency);
      groups.set(currency, group);
    }
    group.providers.add(product.provider);
    group.productCount += 1;

    const rawForecast = forecastByPlate.get(product.licencePlate);
    const hasForecast = !!rawForecast;
    if (hasForecast) {
      group.forecastCount += 1;
      addForecastToGroupTotals(group, rawForecast);
    }

    const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon(
      (rawForecast ?? []).map((value) => ({ ...value, currency })),
      currency,
    );
    const monthlyActuals = alignActualsToHorizon(
      monthlyTotals,
      actualByPlateMonth.get(product.licencePlate) ?? new Map(),
    );

    group.products.push({
      licencePlate: product.licencePlate,
      name: product.name,
      provider: product.provider,
      status: product.status,
      currency,
      hasForecast,
      monthlyTotals,
      monthlyActuals,
      forecastTotal: sumMonthlyValues(monthlyTotals),
      actualTotal: sumKnownActuals(monthlyActuals),
    });
  }

  return {
    totalProducts: products.length,
    productsWithForecast: forecastByPlate.size,
    groups: [...groups.values()].map((group) => {
      const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon([...group.totalsByMonth.values()], group.currency);
      const monthlyActuals = aggregateMonthlyActualsFromProducts(group.products, monthlyTotals.length);
      return {
        currency: group.currency,
        providers: [...group.providers].sort((a, b) => a.localeCompare(b)),
        productCount: group.productCount,
        forecastCount: group.forecastCount,
        monthlyTotals,
        monthlyActuals,
        hasActuals: monthlyActuals.some((amount) => amount != null),
        products: group.products,
      };
    }),
  };
}

export type PlatformForecastSummary = Awaited<ReturnType<typeof getPlatformForecastSummary>>;

/** Tall CSV-friendly rows: product line items plus currency totals. */
export async function buildPlatformForecastExportCsvRows() {
  const summary = await getPlatformForecastSummary();
  const rows: ForecastExportRow[] = [];

  for (const group of summary.groups) {
    const providers = formatForecastProviderList(group.providers);
    const fiscalYearChunks = getFiscalYearChunks(group.monthlyTotals as MonthlyValue[]);
    const lineItemProducts = group.products.filter((product) => product.hasForecast);

    for (const fyChunk of fiscalYearChunks) {
      for (const product of lineItemProducts) {
        appendProductMonthRows(rows, product, fyChunk);
      }
      appendCurrencyTotalRows(rows, group, providers, fyChunk);
    }
  }

  return rows;
}

export async function getProductForecastSummary(licencePlate: string) {
  const forecast = await getProductForecast(licencePlate);
  return { forecast };
}

async function getForecastForProduct(licencePlate: string, forecastId: string) {
  const forecast = await prisma.cloudCostForecast.findUnique({ where: { id: forecastId } });
  if (!forecast) {
    throw new Error('Forecast not found for this product');
  }
  if (forecast.licencePlate !== licencePlate) {
    throw new Error('Forecast not found for this product');
  }
  return forecast;
}

export async function createProductForecast(
  licencePlate: string,
  monthlyValues: MonthlyValue[],
  horizonMonths: number,
) {
  const existing = await getProductForecast(licencePlate);
  if (existing) {
    throw new Error('A forecast already exists for this product');
  }

  return prisma.cloudCostForecast.create({
    data: {
      licencePlate,
      horizonMonths,
      monthlyValues: monthlyValues.map((value) => ({
        year: value.year,
        month: value.month,
        amount: value.amount,
        currency: 'CAD' as const,
      })),
    },
  });
}

export async function updateProductForecast(
  licencePlate: string,
  forecastId: string,
  monthlyValues: MonthlyValue[],
  horizonMonths: number,
) {
  const forecast = await getForecastForProduct(licencePlate, forecastId);

  const existingValues: MonthlyValue[] = (
    (forecast.monthlyValues as { year: number; month: number; amount: number; currency?: string }[]) ?? []
  ).map((value) => ({
    year: value.year,
    month: value.month,
    amount: value.amount,
    currency: 'CAD' as const,
  }));

  const proposedValues: MonthlyValue[] = monthlyValues.map((value) => ({
    year: value.year,
    month: value.month,
    amount: value.amount,
    currency: 'CAD' as const,
  }));

  const lockedValues = preserveLockedPastMonthlyValues(existingValues, proposedValues).map((value) => ({
    ...value,
    currency: 'CAD' as const,
  }));

  return prisma.cloudCostForecast.update({
    where: { id: forecastId },
    data: {
      monthlyValues: lockedValues,
      horizonMonths,
    },
  });
}

/** Empty CAD rolling-horizon template (no budget copy). */
export function seedEmptyForecastMonths(provider: Provider) {
  const currency = PROVIDER_FORECAST_CURRENCY[provider];
  return buildRollingFiscalForecastMonths(0, currency, new Date());
}

export async function seedForecastValues(product: { licencePlate: string; provider: Provider }) {
  const existing = await getProductForecast(product.licencePlate);
  if (existing) {
    const currency = PROVIDER_FORECAST_CURRENCY[product.provider];
    const existingValues = (
      (existing.monthlyValues as { year: number; month: number; amount: number; currency?: string }[]) ?? []
    ).map((value) => ({
      year: value.year,
      month: value.month,
      amount: value.amount,
      currency: 'CAD' as const,
    }));
    return mergeMonthlyValuesOntoFiscalHorizon(existingValues, currency);
  }
  return seedEmptyForecastMonths(product.provider);
}
