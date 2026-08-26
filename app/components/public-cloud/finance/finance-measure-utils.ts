import {
  formatFiscalYearLabel,
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

export function formatCadAmount(amount: number | null | undefined, opts?: { treatMissingAsDash?: boolean }): string {
  if (amount == null) return opts?.treatMissingAsDash === false ? 'CA$0' : '—';
  if (amount === 0) return 'CA$0';
  const abs = Math.abs(amount);
  const formatted =
    abs >= 100
      ? Math.round(amount).toLocaleString('en-CA')
      : amount.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `CA$${formatted}`;
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

export function isCurrentCalendarMonth(year: number, month: number, now = new Date()) {
  return year === now.getFullYear() && month === now.getMonth() + 1;
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

/** Sum forecast amounts for an explicit month set (e.g. FYTD through last complete month). */
export function sumForecastForMonths(values: MonthlyValue[], months: Array<{ year: number; month: number }>) {
  const keys = new Set(months.map((m) => monthKey(m.year, m.month)));
  return values.reduce((sum, v) => (keys.has(monthKey(v.year, v.month)) ? sum + v.amount : sum), 0);
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

export type YtdActualSummary = {
  fytdActual: number | null;
  presentMonths: number;
  expectedMonths: number;
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
  coverage: Pick<YtdActualSummary, 'presentMonths' | 'expectedMonths'>,
  lastComplete: { year: number; month: number },
) {
  if (coverage.expectedMonths === 0) return 'No complete fiscal-year months yet';
  if (coverage.presentMonths < coverage.expectedMonths) {
    return `incomplete (${coverage.presentMonths} of ${coverage.expectedMonths} months)`;
  }
  return `Through last complete month ${lastComplete.year}-${String(lastComplete.month).padStart(2, '0')}`;
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

export { formatFiscalYearLabel, monthKey };
export { isPastMonth } from '@/components/public-cloud/forecast/forecast-grid-utils';
