import {
  formatFiscalYearLabel,
  isPastMonth,
  monthKey,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import { LOW_FORECAST_COVERAGE_PERCENT } from '@/services/public-cloud-finance/constants';

export type VarianceResult = {
  amount: number;
  percent: number | null;
};

/** Actual minus forecast. Undefined when forecast is zero or absent. */
export function calculateVariance(
  actual: number | null | undefined,
  forecast: number | null | undefined,
): VarianceResult | null {
  if (forecast == null || forecast === 0) return null;
  if (actual == null) return null;
  const amount = actual - forecast;
  return { amount, percent: (amount / forecast) * 100 };
}

/** Over forecast is red; at or under forecast is green. */
export function varianceToneClass(variance: VarianceResult | null | undefined) {
  if (variance == null) return '';
  return variance.amount > 0 ? 'text-red-700' : 'text-green-700';
}

export function formatCadAmount(amount: number | null | undefined, opts?: { treatMissingAsDash?: boolean }): string {
  if (amount == null) return opts?.treatMissingAsDash === false ? 'CA$0.00' : '—';
  if (amount === 0) return 'CA$0.00';
  return `CA$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

export function currentFiscalYearBounds(now = new Date()) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const fyStartYear = month >= 4 ? year : year - 1;
  return {
    startYear: fyStartYear,
    startMonth: 4,
    endYear: fyStartYear + 1,
    endMonth: 3,
    label: formatFiscalYearLabel(fyStartYear),
  };
}

/** Last complete calendar month (not the in-progress current month). */
export function lastCompleteMonth(now = new Date()): { year: number; month: number } {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** In-progress calendar month (month-to-date). */
export function currentCalendarMonth(now = new Date()): { year: number; month: number } {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function isCurrentCalendarMonth(year: number, month: number, now = new Date()) {
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

/** Day-of-month / days-in-month so FYTD forecast matches month-to-date actuals. */
export function currentMonthElapsedFraction(now = new Date()) {
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.min(1, Math.max(now.getDate(), 1) / days);
}

export function monthsThrough<T extends { year: number; month: number }>(
  months: T[],
  through: { year: number; month: number },
) {
  return months.filter(
    (month) => month.year < through.year || (month.year === through.year && month.month <= through.month),
  );
}

/** Rankings/export window: YTD through today, or the closed FY once March is complete. */
export function financePeriodMonths(period: 'ytd' | 'full-fy', now = new Date()) {
  const fy = currentFiscalYearBounds(now);
  const fyMonths = fiscalYearMonths(fy.startYear);
  const ytdMonths = monthsThrough(fyMonths, currentCalendarMonth(now));
  if (period !== 'full-fy') return ytdMonths;
  const complete = lastCompleteMonth(now);
  const fyEnded = complete.year > fy.startYear + 1 || (complete.year === fy.startYear + 1 && complete.month >= 3);
  return fyEnded ? fyMonths : ytdMonths;
}

/** Chart/export actual: any month that has stored rollups, otherwise complete like-for-like. */
export function monthlyChartActual(options: {
  year: number;
  month: number;
  actualTotal: number;
  hasCompleteActual: boolean;
  hasRollup: boolean;
  now?: Date;
}): number | null {
  if (options.hasRollup || options.hasCompleteActual) return options.actualTotal;
  return null;
}

export function fiscalYearMonths(fyStartYear: number) {
  const months: Array<{ year: number; month: number }> = [];
  for (let m = 4; m <= 12; m += 1) months.push({ year: fyStartYear, month: m });
  for (let m = 1; m <= 3; m += 1) months.push({ year: fyStartYear + 1, month: m });
  return months;
}

export function sumForecastForFiscalYear(values: MonthlyValue[], fyStartYear: number) {
  const keys = new Set(fiscalYearMonths(fyStartYear).map((m) => monthKey(m.year, m.month)));
  return values.reduce((sum, v) => (keys.has(monthKey(v.year, v.month)) ? sum + v.amount : sum), 0);
}

/** Sum forecast amounts for an explicit month set (e.g. FYTD through today). */
export function sumForecastForMonths(
  values: MonthlyValue[],
  months: Array<{ year: number; month: number }>,
  options?: { now?: Date; prorateCurrent?: boolean },
) {
  const now = options?.now ?? new Date();
  const fraction = options?.prorateCurrent ? currentMonthElapsedFraction(now) : 1;
  const keys = new Set(months.map((m) => monthKey(m.year, m.month)));
  return values.reduce((sum, value) => {
    if (!keys.has(monthKey(value.year, value.month))) return sum;
    if (options?.prorateCurrent && isCurrentCalendarMonth(value.year, value.month, now)) {
      return sum + value.amount * fraction;
    }
    return sum + value.amount;
  }, 0);
}

export function isLowForecastCoverage(coveragePercent: number) {
  return coveragePercent < LOW_FORECAST_COVERAGE_PERCENT;
}

/**
 * Forecast coverage per handoff: a zero counts as a value; a missing month does not.
 * Distinct from isForecastHorizonComplete (which treats zero as incomplete for data-entry UX).
 */
export function hasForecastValuesForRequiredHorizon(values: MonthlyValue[], horizonMonths = 24, now = new Date()) {
  const byKey = new Map(values.map((v) => [monthKey(v.year, v.month), v]));
  for (let i = 0; i < horizonMonths; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    if (!byKey.has(monthKey(d.getFullYear(), d.getMonth() + 1))) return false;
  }
  return true;
}

export function countMissingRequiredHorizonMonths(
  values: MonthlyValue[] | undefined,
  horizonMonths = 24,
  now = new Date(),
) {
  if (!values) return horizonMonths;
  const byKey = new Map(values.map((v) => [monthKey(v.year, v.month), v]));
  let missing = 0;
  for (let i = 0; i < horizonMonths; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    if (!byKey.has(monthKey(d.getFullYear(), d.getMonth() + 1))) missing += 1;
  }
  return missing;
}

export function monthOverMonthChange(current: number, prior: number | null | undefined): number | null {
  if (prior == null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

export function yearOverYearChange(current: number, priorYear: number | null | undefined): number | null {
  if (priorYear == null) return null;
  if (priorYear === 0 && current === 0) return 0;
  if (priorYear === 0) return null;
  return ((current - priorYear) / priorYear) * 100;
}

/** UTC calendar month the account/sub could first have spend (provision, else create). */
export function billingStartMonth(existedAt: Date) {
  return { year: existedAt.getUTCFullYear(), month: existedAt.getUTCMonth() + 1 };
}

/** True when the product existed at any point in that calendar month. */
export function productExistedDuringMonth(existedAt: Date, year: number, month: number) {
  const start = billingStartMonth(existedAt);
  return year > start.year || (year === start.year && month >= start.month);
}

export function filterMonthsProductExisted<T extends { year: number; month: number }>(
  months: T[],
  existedAt: Date | null | undefined,
) {
  if (!existedAt) return months;
  return months.filter((month) => productExistedDuringMonth(existedAt, month.year, month.month));
}

export function expectedPastActualMonths<T extends { year: number; month: number }>(
  months: T[],
  existedAt: Date | null | undefined,
  now = new Date(),
) {
  return filterMonthsProductExisted(
    months.filter((month) => isPastMonth(month.year, month.month, now)),
    existedAt,
  );
}

/** Closed months plus the in-scope current month (FYTD / month-to-date). */
export function expectedYtdActualMonths<T extends { year: number; month: number }>(
  months: T[],
  existedAt: Date | null | undefined,
  now = new Date(),
) {
  return filterMonthsProductExisted(
    months.filter(
      (month) => isPastMonth(month.year, month.month, now) || isCurrentCalendarMonth(month.year, month.month, now),
    ),
    existedAt,
  );
}

export type YtdActualSummary = {
  fytdActual: number | null;
  presentMonths: number;
  expectedMonths: number;
  elapsedMonths?: number;
};

/** Sum YTD rollups. Null when no elapsed month has a rollup (do not treat as CA$0). */
export function summarizeYtdActuals(
  ytdMonths: Array<{ year: number; month: number }>,
  rollups: Array<{ year: number; month: number; amountCad: number }>,
): YtdActualSummary {
  const expectedMonths = ytdMonths.length;
  const ytdKeys = new Set(ytdMonths.map((month) => monthKey(month.year, month.month)));
  const presentKeys = new Set<string>();
  let total = 0;
  for (const row of rollups) {
    const key = monthKey(row.year, row.month);
    if (!ytdKeys.has(key)) continue;
    presentKeys.add(key);
    total += row.amountCad;
  }
  return {
    fytdActual: presentKeys.size === 0 ? null : total,
    presentMonths: presentKeys.size,
    expectedMonths,
  };
}

export function ytdActualHint(
  coverage: Pick<YtdActualSummary, 'presentMonths' | 'expectedMonths' | 'elapsedMonths'>,
  through: { year: number; month: number },
  options?: { includesPartialCurrent?: boolean },
) {
  const elapsed = coverage.elapsedMonths ?? coverage.expectedMonths;
  const throughLabel = `${through.year}-${String(through.month).padStart(2, '0')}`;
  if (elapsed === 0) return 'No fiscal-year months yet';
  if (coverage.expectedMonths === 0) {
    if (options?.includesPartialCurrent) return `Includes month-to-date ${throughLabel}`;
    return 'No products existed in the fiscal year to date';
  }
  if (coverage.presentMonths < coverage.expectedMonths) {
    return `incomplete (${coverage.presentMonths} of ${coverage.expectedMonths} closed months)`;
  }
  if (options?.includesPartialCurrent) {
    return `Includes month-to-date ${throughLabel}`;
  }
  return `Through ${throughLabel}`;
}

export type IngestionRunStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export type IngestionFreshnessLatest = {
  status: IngestionRunStatus;
  completedAt: string | null;
  errorMessage: string | null;
};

export type IngestionFreshness = {
  provider: string;
  lastSuccessAt: string | null;
  latest: IngestionFreshnessLatest | null;
};

export function buildIngestionFreshness(
  provider: string,
  latest: { status: IngestionRunStatus; completedAt: Date | string | null; errorMessage: string | null } | null,
  lastSuccessAt: Date | string | null,
): IngestionFreshness {
  return {
    provider,
    lastSuccessAt: lastSuccessAt ? new Date(lastSuccessAt).toISOString() : null,
    latest: latest
      ? {
          status: latest.status,
          completedAt: latest.completedAt ? new Date(latest.completedAt).toISOString() : null,
          errorMessage: latest.errorMessage,
        }
      : null,
  };
}

export function formatIngestionFreshnessLine(item: IngestionFreshness) {
  if (!item.latest) return 'never';
  const lastSuccess = item.lastSuccessAt ? new Date(item.lastSuccessAt).toLocaleString('en-CA') : 'never';
  if (item.latest.status === 'FAILED') return `${lastSuccess} · last run failed`;
  if (item.latest.status === 'RUNNING') return `${lastSuccess} · running`;
  return lastSuccess;
}

export function failedIngestProviders(freshness: IngestionFreshness[]) {
  return freshness.filter((item) => item.latest?.status === 'FAILED').map((item) => item.provider);
}

export function monthsWithCompleteRollups(
  months: Array<{ year: number; month: number }>,
  expectedPlatesByMonth: Map<string, string[]>,
  rollupPlatesByMonth: Map<string, Set<string>>,
) {
  return months.filter((month) => {
    const key = monthKey(month.year, month.month);
    const expected = expectedPlatesByMonth.get(key) ?? [];
    if (expected.length === 0) return false;
    const have = rollupPlatesByMonth.get(key) ?? new Set();
    return expected.every((plate) => have.has(plate));
  });
}

export function likeForLikeMonths(
  months: Array<{ year: number; month: number }>,
  products: Array<{ licencePlate: string }>,
  billingStartedByPlate: Map<string, Date>,
  rollups: Array<{ licencePlate: string; year: number; month: number }>,
) {
  const expectedPlatesByMonth = new Map<string, string[]>();
  const expectedMonths = months.filter((month) => {
    const plates = products
      .filter((product) => {
        const startedAt = billingStartedByPlate.get(product.licencePlate);
        return startedAt ? productExistedDuringMonth(startedAt, month.year, month.month) : false;
      })
      .map((product) => product.licencePlate);
    expectedPlatesByMonth.set(monthKey(month.year, month.month), plates);
    return plates.length > 0;
  });
  return {
    expectedMonths,
    completeMonths: monthsWithCompleteRollups(expectedMonths, expectedPlatesByMonth, indexRollupPlatesByMonth(rollups)),
  };
}

export function indexRollupPlatesByMonth(rollups: Array<{ licencePlate: string; year: number; month: number }>) {
  const byMonth = new Map<string, Set<string>>();
  for (const row of rollups) {
    const key = monthKey(row.year, row.month);
    const plates = byMonth.get(key) ?? new Set<string>();
    plates.add(row.licencePlate);
    byMonth.set(key, plates);
  }
  return byMonth;
}

export function elapsedLikeForLikeTotals(
  months: Array<{ year: number; month: number }>,
  actuals: Array<number | null | undefined>,
  forecasts: Array<number | null | undefined>,
  now = new Date(),
) {
  const pastIndexes = months
    .map((month, index) => (isPastMonth(month.year, month.month, now) ? index : -1))
    .filter((index) => index >= 0);
  const currentIndex = months.findIndex((month) => isCurrentCalendarMonth(month.year, month.month, now));
  const complete = pastIndexes.every((index) => actuals[index] != null);
  const ytdIndexes = currentIndex >= 0 ? [...pastIndexes, currentIndex] : pastIndexes;
  const actual = sumKnownActualsOrNull(ytdIndexes.map((index) => actuals[index]));
  const fraction = currentMonthElapsedFraction(now);
  const forecast = ytdIndexes.reduce((sum, index) => {
    const amount = forecasts[index] ?? 0;
    if (index === currentIndex) return sum + amount * fraction;
    return sum + amount;
  }, 0);
  return {
    actual,
    forecast,
    complete,
    variance: complete ? calculateVariance(actual, forecast) : null,
  };
}

/** Known actuals only. Null when none of the amounts are present. */
export function sumKnownActualsOrNull(amounts: Array<number | null | undefined>): number | null {
  let any = false;
  let sum = 0;
  for (const amount of amounts) {
    if (amount == null) continue;
    any = true;
    sum += amount;
  }
  return any ? sum : null;
}

export { formatFiscalYearLabel, monthKey, isPastMonth };
