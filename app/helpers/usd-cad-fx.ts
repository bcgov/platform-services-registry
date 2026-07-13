/**
 * USD → CAD FX for public-cloud forecast.
 *
 * BC Gov budgets and forecasts are in CAD. AWS invoices in USD, so Registry
 * converts AWS actuals to CAD using a monthly rate:
 * - Past / closed months: "actual" rate once known (AWS typically settles a few
 *   days after month end).
 * - Current / future months: "tentative" working rate for forecasting context.
 *
 * Rates below are local/dev defaults approximating recent USD/CAD levels.
 * Replace with CSP- or finance-supplied rates when available.
 */

export type FxRateStatus = 'actual' | 'tentative';

export type UsdCadFxRate = {
  year: number;
  month: number;
  /** CAD per 1 USD */
  rate: number;
  status: FxRateStatus;
};

/** Approximate CAD per USD by calendar month (YYYY-MM). */
const KNOWN_USD_CAD_RATES: Record<string, { rate: number; status: FxRateStatus }> = {
  '2025-10': { rate: 1.38, status: 'actual' },
  '2025-11': { rate: 1.4, status: 'actual' },
  '2025-12': { rate: 1.435, status: 'actual' },
  '2026-01': { rate: 1.44, status: 'actual' },
  '2026-02': { rate: 1.43, status: 'actual' },
  '2026-03': { rate: 1.42, status: 'actual' },
  '2026-04': { rate: 1.39, status: 'actual' },
  '2026-05': { rate: 1.37, status: 'actual' },
  '2026-06': { rate: 1.36, status: 'actual' },
};

const FALLBACK_USD_CAD_RATE = 1.37;

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function isPastBillingMonth(year: number, month: number, now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

export function getUsdToCadRate(year: number, month: number, now = new Date()): UsdCadFxRate {
  const known = KNOWN_USD_CAD_RATES[monthKey(year, month)];
  if (known) {
    return { year, month, rate: known.rate, status: known.status };
  }

  // Closed months without a published rate still need a working conversion;
  // mark tentative until finance/CSP supplies the invoice rate.
  if (isPastBillingMonth(year, month, now)) {
    return { year, month, rate: FALLBACK_USD_CAD_RATE, status: 'tentative' };
  }

  return { year, month, rate: FALLBACK_USD_CAD_RATE, status: 'tentative' };
}

export function convertUsdToCad(amountUsd: number, year: number, month: number, now = new Date()) {
  const { rate } = getUsdToCadRate(year, month, now);
  // Forecast/actual displays use whole dollars; round to avoid float noise in editors.
  return Math.round(amountUsd * rate);
}

export function formatUsdCadRate(rate: number) {
  return rate.toFixed(4);
}

/** Providers whose CSP actuals arrive in USD and must be converted for CAD reporting. */
export function providerReportsActualsInUsd(provider: string) {
  return provider === 'AWS' || provider === 'AWS_LZA';
}
