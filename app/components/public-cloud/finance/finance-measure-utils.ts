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

export { formatFiscalYearLabel, isPastMonth, monthKey };
