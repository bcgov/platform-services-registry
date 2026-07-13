export type MonthlyValue = {
  year: number;
  month: number;
  amount: number;
  currency: string;
};

export type ForecastCellStatus = 'confirmed' | 'needsReview' | 'suggested' | 'past';

/** Rolling forecast horizon: the current month plus 23 future months. */
export const FISCAL_FORECAST_HORIZON_MONTHS = 24;

const FISCAL_YEAR_START_MONTH = 4;

export function monthKey(year: number, month: number) {
  return `${year}-${month}`;
}

export function getFiscalYearStartForMonth(year: number, month: number) {
  return month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
}

export function getFiscalYearStartYear(date = new Date()) {
  return getFiscalYearStartForMonth(date.getFullYear(), date.getMonth() + 1);
}

export function formatFiscalYearLabel(fiscalStartYear: number) {
  const start = String(fiscalStartYear).slice(-2);
  const end = String(fiscalStartYear + 1).slice(-2);
  return `FY${start}/${end}`;
}

export function shortMonthLabel(year: number, month: number) {
  const mon = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${mon} '${String(year).slice(-2)}`;
}

export function yearRangeLabel(values: MonthlyValue[]) {
  if (!values.length) return '';
  const first = values[0];
  const last = values.at(-1);
  if (!last) return '';
  const fmt = (y: number, m: number) =>
    new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return `${fmt(first.year, first.month)} – ${fmt(last.year, last.month)}`;
}

export function formatForecastAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sumMonthlyValues(values: MonthlyValue[]) {
  return values.reduce((sum, v) => sum + v.amount, 0);
}

export function buildFiscalForecastMonths(
  horizonFiscalYears: number,
  monthlyAmount: number,
  currency: string,
  now = new Date(),
): MonthlyValue[] {
  const fiscalStartYear = getFiscalYearStartYear(now);
  const startDate = new Date(fiscalStartYear, FISCAL_YEAR_START_MONTH - 1, 1);
  const monthCount = horizonFiscalYears * 12;
  const monthlyValues: MonthlyValue[] = [];

  for (let i = 0; i < monthCount; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    monthlyValues.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      amount: monthlyAmount,
      currency,
    });
  }

  return monthlyValues;
}

/**
 * Grid months for the rolling forecast: from the start of the current fiscal
 * year (April) through the current month + (horizonMonths - 1), so the grid
 * always contains exactly `horizonMonths` current/future months. Whenever the
 * window extends past the next fiscal year this produces a partial third
 * fiscal-year chunk.
 */
export function buildRollingFiscalForecastMonths(
  monthlyAmount: number,
  currency: string,
  now = new Date(),
  horizonMonths = FISCAL_FORECAST_HORIZON_MONTHS,
): MonthlyValue[] {
  const fiscalStartYear = getFiscalYearStartYear(now);
  const startDate = new Date(fiscalStartYear, FISCAL_YEAR_START_MONTH - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + horizonMonths - 1, 1);
  const monthCount =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;

  const monthlyValues: MonthlyValue[] = [];
  for (let i = 0; i < monthCount; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    monthlyValues.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      amount: monthlyAmount,
      currency,
    });
  }

  return monthlyValues;
}

export function mergeMonthlyValuesOntoFiscalHorizon(
  existing: MonthlyValue[],
  currency = 'CAD',
  now = new Date(),
): MonthlyValue[] {
  const template = buildRollingFiscalForecastMonths(0, currency, now);
  const byKey = new Map(existing.map((v) => [monthKey(v.year, v.month), v]));

  return template.map((slot) => {
    const found = byKey.get(monthKey(slot.year, slot.month));
    if (found) {
      return { ...found, currency: found.currency || currency };
    }
    return slot;
  });
}

export function chunkByFiscalYear(values: MonthlyValue[]) {
  const chunks: MonthlyValue[][] = [];
  let currentFyStart: number | null = null;
  let currentChunk: MonthlyValue[] = [];

  for (const value of values) {
    const fyStart = getFiscalYearStartForMonth(value.year, value.month);
    if (currentFyStart !== null && fyStart !== currentFyStart) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
    currentFyStart = fyStart;
    currentChunk.push(value);
  }

  if (currentChunk.length) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export type FiscalYearChunk = {
  fiscalStartYear: number;
  label: string;
  months: MonthlyValue[];
  startIndex: number;
};

export function getFiscalYearChunks(values: MonthlyValue[]): FiscalYearChunk[] {
  const chunks = chunkByFiscalYear(values);
  let startIndex = 0;

  return chunks.map((months) => {
    const fiscalStartYear = getFiscalYearStartForMonth(months[0].year, months[0].month);
    const chunk = {
      fiscalStartYear,
      label: formatFiscalYearLabel(fiscalStartYear),
      months,
      startIndex,
    };
    startIndex += months.length;
    return chunk;
  });
}

/** @deprecated Use chunkByFiscalYear for forecast grids. */
export function chunkByYear(values: MonthlyValue[], monthsPerYear = 12) {
  const chunks: MonthlyValue[][] = [];
  for (let i = 0; i < values.length; i += monthsPerYear) {
    chunks.push(values.slice(i, i + monthsPerYear));
  }
  return chunks;
}

type QuarterlyReviewHint = {
  poSignedOff: boolean;
  forecastMonthsReviewed?: boolean;
  status?: string;
} | null;

export function getCurrentQuarterMonthKeys(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarterStart = Math.floor((month - 1) / 3) * 3 + 1;
  return [0, 1, 2].map((i) => monthKey(year, quarterStart + i));
}

export function getReviewWindowStartIndex(values: MonthlyValue[], now = new Date()) {
  const quarterKeys = getCurrentQuarterMonthKeys(now);
  for (let i = 0; i < values.length; i++) {
    const key = monthKey(values[i].year, values[i].month);
    if (quarterKeys.includes(key)) return i;
  }
  return -1;
}

export function isPastMonth(year: number, month: number, now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

export function getCellStatuses(
  values: MonthlyValue[],
  options: {
    quarterlyReview: QuarterlyReviewHint;
    activeBaseline: MonthlyValue[] | null;
    confirmedKeys: Set<string>;
    editable: boolean;
    now?: Date;
  },
): ForecastCellStatus[] {
  const { quarterlyReview, confirmedKeys, editable, now = new Date() } = options;
  // Highlight months needing review even in read-only so users see work before entering edit.
  const reviewDue =
    Boolean(quarterlyReview) &&
    !quarterlyReview?.poSignedOff &&
    !quarterlyReview?.forecastMonthsReviewed &&
    quarterlyReview?.status !== 'COMPLETE';

  return values.map((v) => {
    const key = monthKey(v.year, v.month);

    if (isPastMonth(v.year, v.month, now)) {
      return 'past';
    }

    if (confirmedKeys.has(key)) return 'confirmed';

    if (reviewDue) return 'needsReview';

    if (!editable) return 'confirmed';

    return 'suggested';
  });
}

export function getInitialConfirmedKeys(
  values: MonthlyValue[],
  _activeBaseline: MonthlyValue[] | null,
  _quarterlyReview: QuarterlyReviewHint,
  now = new Date(),
) {
  const keys = new Set<string>();

  values.forEach((v) => {
    if (isPastMonth(v.year, v.month, now)) {
      keys.add(monthKey(v.year, v.month));
    }
  });

  return keys;
}

/** Keep past-month amounts from baseline; only current/future months may change. */
export function preserveLockedPastMonthlyValues(
  baseline: MonthlyValue[],
  proposed: MonthlyValue[],
  now = new Date(),
): MonthlyValue[] {
  const baselineByKey = new Map(baseline.map((v) => [monthKey(v.year, v.month), v]));

  return proposed.map((v) => {
    if (isPastMonth(v.year, v.month, now)) {
      return baselineByKey.get(monthKey(v.year, v.month)) ?? v;
    }
    return v;
  });
}

export function countCellsAwaitingForecast(statuses: ForecastCellStatus[]) {
  return statuses.filter((s) => s === 'needsReview' || s === 'suggested').length;
}

/** True when every month in the rolling horizon (current month onward) has a forecast amount. */
export function isForecastHorizonComplete(
  values: MonthlyValue[],
  horizonMonths = FISCAL_FORECAST_HORIZON_MONTHS,
  now = new Date(),
) {
  const byKey = new Map(values.map((v) => [monthKey(v.year, v.month), v]));

  for (let i = 0; i < horizonMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = byKey.get(monthKey(d.getFullYear(), d.getMonth() + 1));
    if (!value || value.amount <= 0) return false;
  }

  return true;
}

function isEditableForecastCell(status: ForecastCellStatus) {
  return status === 'suggested' || status === 'needsReview';
}

/** Copy a source month's amount to all editable cells. */
export function copyAmountAcrossEditableMonths(
  values: MonthlyValue[],
  statuses: ForecastCellStatus[],
  sourceIndex: number,
): MonthlyValue[] {
  const sourceAmount = values[sourceIndex]?.amount ?? 0;
  return values.map((v, i) => (isEditableForecastCell(statuses[i]) ? { ...v, amount: sourceAmount } : v));
}

/** Copy a source month's amount to all later editable cells. */
export function applyAmountToFutureMonths(
  values: MonthlyValue[],
  statuses: ForecastCellStatus[],
  sourceIndex: number,
  amount: number,
): MonthlyValue[] {
  return values.map((v, i) => {
    if (i <= sourceIndex || !isEditableForecastCell(statuses[i])) {
      return v;
    }
    return { ...v, amount };
  });
}

export function isInProgressFiscalYear(fyChunk: FiscalYearChunk, now = new Date()) {
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const first = fyChunk.months[0];
  const last = fyChunk.months.at(-1);
  if (!first || !last) return false;
  const nowIndex = nowYear * 12 + nowMonth;
  const startIndex = first.year * 12 + first.month;
  const endIndex = last.year * 12 + last.month;
  return nowIndex >= startIndex && nowIndex <= endIndex;
}

/** A fiscal-year chunk that only covers part of the year (the tail of the rolling window). */
export function isPartialFiscalYearChunk(fyChunk: FiscalYearChunk) {
  return fyChunk.months.length < 12;
}

export type ForecastIncrease = {
  year: number;
  month: number;
  previousAmount: number;
  newAmount: number;
};

export function getForecastIncreases(proposed: MonthlyValue[], baseline: MonthlyValue[], now = new Date()) {
  const baselineByKey = new Map(baseline.map((v) => [monthKey(v.year, v.month), v]));
  const increases: ForecastIncrease[] = [];

  for (const value of proposed) {
    if (isPastMonth(value.year, value.month, now)) continue;
    const previous = baselineByKey.get(monthKey(value.year, value.month))?.amount ?? 0;
    if (value.amount > previous) {
      increases.push({
        year: value.year,
        month: value.month,
        previousAmount: previous,
        newAmount: value.amount,
      });
    }
  }

  return increases;
}

/** Sum enabled environment monthly budgets (dev/test/prod/tools). */
export function sumEnabledEnvironmentBudgets(
  budget: { dev: number; test: number; prod: number; tools: number },
  environmentsEnabled: {
    development: boolean;
    test: boolean;
    production: boolean;
    tools: boolean;
  },
) {
  let total = 0;
  if (environmentsEnabled.development) total += budget.dev;
  if (environmentsEnabled.test) total += budget.test;
  if (environmentsEnabled.production) total += budget.prod;
  if (environmentsEnabled.tools) total += budget.tools;
  return Math.round(total);
}

export function getProviderSpendLabel(provider?: string) {
  switch (provider) {
    case 'AZURE':
      return 'Azure Spend';
    case 'AWS':
    case 'AWS_LZA':
      return 'AWS Spend';
    default:
      return 'Cloud Spend';
  }
}

/** Short provider name for filters, tables, and export sheets. */
export function formatForecastProviderLabel(provider: string) {
  if (provider === 'AWS_LZA') return 'AWS LZA';
  if (provider === 'AWS') return 'AWS';
  if (provider === 'AZURE') return 'Azure';
  return provider;
}

export function formatForecastProviderList(providers: string[]) {
  return providers.map(formatForecastProviderLabel).join(' / ');
}

/** Roll up product monthly totals onto the fiscal horizon (optionally only products with a forecast). */
export function aggregateMonthlyTotalsFromProducts(
  products: { monthlyTotals: MonthlyValue[]; hasForecast?: boolean }[],
  currency: string,
  onlyWithForecast = false,
): MonthlyValue[] {
  const totalsByMonth = new Map<string, MonthlyValue>();

  for (const product of products) {
    if (onlyWithForecast && !product.hasForecast) continue;

    for (const value of product.monthlyTotals) {
      const key = monthKey(value.year, value.month);
      const existing = totalsByMonth.get(key);
      if (existing) {
        existing.amount += value.amount;
      } else {
        totalsByMonth.set(key, { ...value, currency });
      }
    }
  }

  return mergeMonthlyValuesOntoFiscalHorizon([...totalsByMonth.values()], currency);
}
