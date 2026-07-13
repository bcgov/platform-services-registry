import {
  buildRollingFiscalForecastMonths,
  getFiscalYearChunks,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  preserveLockedPastMonthlyValues,
  shortMonthLabel,
  sumMonthlyValues,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import prisma from '@/core/prisma';
import { convertUsdToCad } from '@/helpers/usd-cad-fx';
import { CloudCostForecastStatus, Provider, ProjectStatus } from '@/prisma/client';

export async function getActiveApprovedForecast(licencePlate: string) {
  return prisma.cloudCostForecast.findFirst({
    where: { licencePlate, status: CloudCostForecastStatus.APPROVED },
    orderBy: { version: 'desc' },
  });
}

/** All public-cloud forecasts and platform rollups are reported in CAD. */
export const PROVIDER_FORECAST_CURRENCY: Record<Provider, 'CAD'> = {
  [Provider.AWS]: 'CAD',
  [Provider.AWS_LZA]: 'CAD',
  [Provider.AZURE]: 'CAD',
};

/**
 * Platform-wide forecast rollup for the admin dashboard: sums the latest
 * approved forecast of every active public cloud product per month.
 * All forecasts and rollups are in CAD.
 */
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

  const approvedForecasts = await prisma.cloudCostForecast.findMany({
    where: {
      licencePlate: { in: licencePlates },
      status: CloudCostForecastStatus.APPROVED,
    },
    orderBy: { version: 'desc' },
    select: { licencePlate: true, monthlyValues: true },
  });

  // Ordered by version desc, so the first forecast seen per plate is the active one.
  const activeForecastByPlate = new Map<string, MonthlyValue[]>();
  for (const forecast of approvedForecasts) {
    if (!activeForecastByPlate.has(forecast.licencePlate)) {
      activeForecastByPlate.set(forecast.licencePlate, forecast.monthlyValues as MonthlyValue[]);
    }
  }

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

    const rawForecast = activeForecastByPlate.get(product.licencePlate);
    const hasForecast = !!rawForecast;
    if (hasForecast) {
      group.forecastCount += 1;
      for (const value of rawForecast) {
        const key = monthKey(value.year, value.month);
        const amount = value.currency === 'USD' ? convertUsdToCad(value.amount, value.year, value.month) : value.amount;
        const existing = group.totalsByMonth.get(key);
        if (existing) {
          existing.amount += amount;
        } else {
          group.totalsByMonth.set(key, { year: value.year, month: value.month, amount, currency });
        }
      }
    }

    const normalizedForecast = (rawForecast ?? []).map((value) => ({
      ...value,
      amount: value.currency === 'USD' ? convertUsdToCad(value.amount, value.year, value.month) : value.amount,
      currency,
    }));
    const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon(normalizedForecast, currency);

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
    productsWithForecast: activeForecastByPlate.size,
    groups: [...groups.values()].map((group) => {
      const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon([...group.totalsByMonth.values()], group.currency);
      return {
        currency: group.currency,
        providers: [...group.providers].sort(),
        productCount: group.productCount,
        forecastCount: group.forecastCount,
        monthlyTotals,
        products: group.products,
      };
    }),
  };
}

export type PlatformForecastSummary = Awaited<ReturnType<typeof getPlatformForecastSummary>>;

function providerSheetLabel(providers: string[]) {
  return providers
    .map((provider) => {
      if (provider === Provider.AWS_LZA) return 'AWS LZA';
      if (provider === Provider.AWS) return 'AWS';
      if (provider === Provider.AZURE) return 'Azure';
      return provider;
    })
    .join(' / ');
}

/** Tall CSV-friendly rows: product line items plus currency totals. */
export async function buildPlatformForecastExportCsvRows() {
  const summary = await getPlatformForecastSummary();
  const rows: Record<string, string | number>[] = [];

  for (const group of summary.groups) {
    const providers = providerSheetLabel(group.providers);
    const fiscalYearChunks = getFiscalYearChunks(group.monthlyTotals as MonthlyValue[]);
    const lineItemProducts = group.products.filter((product) => product.hasForecast);

    for (const fyChunk of fiscalYearChunks) {
      for (const product of lineItemProducts) {
        for (let i = 0; i < fyChunk.months.length; i++) {
          const month = fyChunk.months[i];
          const forecast = product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0;
          rows.push({
            Level: 'Product',
            'Licence plate': product.licencePlate,
            'Product name': product.name,
            Currency: product.currency,
            Providers: providerSheetLabel([product.provider]),
            'Fiscal year': fyChunk.label,
            Month: shortMonthLabel(month.year, month.month),
            'Month key': `${month.year}-${String(month.month).padStart(2, '0')}`,
            Forecast: forecast,
          });
        }
      }

      for (let i = 0; i < fyChunk.months.length; i++) {
        const month = fyChunk.months[i];
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
  const [activeForecast, forecasts] = await Promise.all([
    getActiveApprovedForecast(licencePlate),
    prisma.cloudCostForecast.findMany({
      where: { licencePlate },
      orderBy: { version: 'desc' },
      take: 10,
    }),
  ]);

  return {
    activeForecast,
    forecasts,
  };
}

/** Load a forecast, ensuring it belongs to the product the caller was authorized for. */
async function getForecastForProduct(licencePlate: string, forecastId: string) {
  const forecast = await prisma.cloudCostForecast.findUnique({ where: { id: forecastId } });
  if (!forecast || forecast.licencePlate !== licencePlate) {
    throw new Error('Forecast not found for this product');
  }
  return forecast;
}

/** Create the product's active forecast (no approval workflow). */
export async function createForecastDraft(
  licencePlate: string,
  monthlyValues: { year: number; month: number; amount: number; currency: string }[],
  horizonMonths: number,
) {
  const existing = await getActiveApprovedForecast(licencePlate);
  if (existing) {
    throw new Error('A forecast already exists for this product');
  }

  const latest = await prisma.cloudCostForecast.findFirst({
    where: { licencePlate },
    orderBy: { version: 'desc' },
  });

  const version = latest ? latest.version + 1 : 1;
  const product = await prisma.publicCloudProduct.findFirst({ where: { licencePlate } });

  return prisma.cloudCostForecast.create({
    data: {
      licencePlate,
      status: CloudCostForecastStatus.APPROVED,
      version,
      horizonMonths,
      monthlyValues,
      sourceBudgetSnapshot: product?.budget ?? undefined,
    },
  });
}

/** Update the product's active forecast monthly values. */
export async function updateForecastDraft(
  licencePlate: string,
  forecastId: string,
  monthlyValues: { year: number; month: number; amount: number; currency: string }[],
  horizonMonths: number,
) {
  const forecast = await getForecastForProduct(licencePlate, forecastId);
  if (forecast.status !== CloudCostForecastStatus.APPROVED) {
    throw new Error('Only the active forecast can be updated');
  }

  const existingValues =
    (forecast.monthlyValues as {
      year: number;
      month: number;
      amount: number;
      currency: string;
    }[]) ?? [];

  const sanitizedValues = preserveLockedPastMonthlyValues(existingValues, monthlyValues);

  return prisma.cloudCostForecast.update({
    where: { id: forecastId },
    data: {
      monthlyValues: sanitizedValues,
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
  let total = 0;
  if (environmentsEnabled.development) total += budget.dev;
  if (environmentsEnabled.test) total += budget.test;
  if (environmentsEnabled.production) total += budget.prod;
  if (environmentsEnabled.tools) total += budget.tools;

  const now = new Date();
  return buildRollingFiscalForecastMonths(total, currency, now);
}

/**
 * Seed values for a new forecast draft: reuse the active approved forecast
 * (merged onto the current rolling horizon) when one exists, otherwise fall
 * back to the product budget estimates.
 */
export async function seedForecastDraftValues(product: {
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
  const activeForecast = await getActiveApprovedForecast(product.licencePlate);
  if (activeForecast) {
    const currency = PROVIDER_FORECAST_CURRENCY[product.provider];
    return mergeMonthlyValuesOntoFiscalHorizon(activeForecast.monthlyValues as MonthlyValue[], currency);
  }
  return seedForecastFromProductBudget(product.provider, product.budget, product.environmentsEnabled);
}
