import {
  buildRollingFiscalForecastMonths,
  formatForecastProviderList,
  getFiscalYearChunks,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
  sumEnabledEnvironmentBudgets,
  sumMonthlyValues,
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
  currency: 'CAD';
  hasForecast: boolean;
  monthlyTotals: MonthlyValue[];
  forecastTotal: number;
};

export async function getPlatformForecastSummary() {
  const products = await prisma.publicCloudProduct.findMany({
    where: { status: ProjectStatus.ACTIVE },
    select: { licencePlate: true, name: true, provider: true },
    orderBy: [{ provider: 'asc' }, { name: 'asc' }],
  });
  const licencePlates = products.map((p) => p.licencePlate);

  const forecasts = await prisma.cloudCostForecast.findMany({
    where: { licencePlate: { in: licencePlates } },
    select: { licencePlate: true, monthlyValues: true },
  });

  const forecastByPlate = new Map(
    forecasts.map((forecast) => [forecast.licencePlate, forecast.monthlyValues as MonthlyValue[]]),
  );

  type CurrencyGroup = {
    currency: 'CAD';
    providers: Set<Provider>;
    productCount: number;
    forecastCount: number;
    totalsByMonth: Map<string, MonthlyValue>;
    products: PlatformForecastProduct[];
  };
  const groups = new Map<'CAD', CurrencyGroup>();

  for (const product of products) {
    const currency = PROVIDER_FORECAST_CURRENCY[product.provider];
    let group = groups.get(currency);
    if (!group) {
      group = {
        currency,
        providers: new Set(),
        productCount: 0,
        forecastCount: 0,
        totalsByMonth: new Map(),
        products: [],
      };
      groups.set(currency, group);
    }
    group.providers.add(product.provider);
    group.productCount += 1;

    const rawForecast = forecastByPlate.get(product.licencePlate);
    const hasForecast = !!rawForecast;
    if (hasForecast) {
      group.forecastCount += 1;
      for (const value of rawForecast) {
        const key = monthKey(value.year, value.month);
        const existing = group.totalsByMonth.get(key);
        if (existing) {
          existing.amount += value.amount;
        } else {
          group.totalsByMonth.set(key, { year: value.year, month: value.month, amount: value.amount, currency });
        }
      }
    }

    const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon(
      (rawForecast ?? []).map((value) => ({ ...value, currency })),
      currency,
    );

    group.products.push({
      licencePlate: product.licencePlate,
      name: product.name,
      provider: product.provider,
      currency,
      hasForecast,
      monthlyTotals,
      forecastTotal: sumMonthlyValues(monthlyTotals),
    });
  }

  return {
    totalProducts: products.length,
    productsWithForecast: forecastByPlate.size,
    groups: [...groups.values()].map((group) => ({
      currency: group.currency,
      providers: [...group.providers].sort((a, b) => a.localeCompare(b)),
      productCount: group.productCount,
      forecastCount: group.forecastCount,
      monthlyTotals: mergeMonthlyValuesOntoFiscalHorizon([...group.totalsByMonth.values()], group.currency),
      products: group.products,
    })),
  };
}

export type PlatformForecastSummary = Awaited<ReturnType<typeof getPlatformForecastSummary>>;

/** Tall CSV-friendly rows: product line items plus currency totals. */
export async function buildPlatformForecastExportCsvRows() {
  const summary = await getPlatformForecastSummary();
  const rows: Record<string, string | number>[] = [];

  for (const group of summary.groups) {
    const providers = formatForecastProviderList(group.providers);
    const fiscalYearChunks = getFiscalYearChunks(group.monthlyTotals as MonthlyValue[]);
    const lineItemProducts = group.products.filter((product) => product.hasForecast);

    for (const fyChunk of fiscalYearChunks) {
      for (const product of lineItemProducts) {
        for (let i = 0; i < fyChunk.months.length; i++) {
          const month = fyChunk.months[i];
          rows.push({
            Level: 'Product',
            'Licence plate': product.licencePlate,
            'Product name': product.name,
            Currency: product.currency,
            Providers: formatForecastProviderList([product.provider]),
            'Fiscal year': fyChunk.label,
            Month: shortMonthLabel(month.year, month.month),
            'Month key': `${month.year}-${String(month.month).padStart(2, '0')}`,
            Forecast: product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0,
          });
        }
      }

      for (const month of fyChunk.months) {
        rows.push({
          Level: 'Currency total',
          'Licence plate': '',
          'Product name': '',
          Currency: group.currency,
          Providers: providers,
          'Fiscal year': fyChunk.label,
          Month: shortMonthLabel(month.year, month.month),
          'Month key': `${month.year}-${String(month.month).padStart(2, '0')}`,
          Forecast: month.amount,
        });
      }
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
  monthlyValues: { year: number; month: number; amount: number; currency: string }[],
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
      monthlyValues,
    },
  });
}

export async function updateProductForecast(
  licencePlate: string,
  forecastId: string,
  monthlyValues: { year: number; month: number; amount: number; currency: string }[],
  horizonMonths: number,
) {
  const forecast = await getForecastForProduct(licencePlate, forecastId);

  const existingValues =
    (forecast.monthlyValues as {
      year: number;
      month: number;
      amount: number;
      currency: string;
    }[]) ?? [];

  return prisma.cloudCostForecast.update({
    where: { id: forecastId },
    data: {
      monthlyValues: preserveLockedPastMonthlyValues(existingValues, monthlyValues),
      horizonMonths,
    },
  });
}

export function seedForecastFromProductBudget(
  provider: Provider,
  budget: { dev: number; test: number; prod: number; tools: number },
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  },
) {
  const currency = PROVIDER_FORECAST_CURRENCY[provider];
  const total = sumEnabledEnvironmentBudgets(budget, environmentsEnabled);
  return buildRollingFiscalForecastMonths(total, currency, new Date());
}

export async function seedForecastValues(product: {
  licencePlate: string;
  provider: Provider;
  budget: { dev: number; test: number; prod: number; tools: number };
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  };
}) {
  const existing = await getProductForecast(product.licencePlate);
  if (existing) {
    const currency = PROVIDER_FORECAST_CURRENCY[product.provider];
    return mergeMonthlyValuesOntoFiscalHorizon(existing.monthlyValues as MonthlyValue[], currency);
  }
  return seedForecastFromProductBudget(product.provider, product.budget, product.environmentsEnabled);
}
