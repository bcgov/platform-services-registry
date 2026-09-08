/**
 * Shared currency exchange helpers for public cloud finance and future registry services.
 * Rates are sourced from Bank of Canada Valet (see `@/services/bank-of-canada`).
 */
export {
  clearUsdCadExchangeRateCache,
  fetchUsdCadExchangeRate,
  fetchUsdCadExchangeRateForMonth,
  parseBocUsdCadMonthEndResponse,
  parseBocUsdCadResponse,
  type UsdCadExchangeRate,
} from '@/services/bank-of-canada/usd-cad-rate';

export type CurrencyCode = 'USD' | 'CAD';

function roundToCents(amount: number) {
  return Math.round(amount * 100) / 100;
}

/** Convert an amount between supported currencies. Result is rounded to cents. Zero and same-currency skip FX. */
export function convertCurrencyAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  usdCadRate?: number,
): number {
  if (from === to) return amount;
  if (amount === 0) return 0;

  if (from === 'USD' && to === 'CAD') {
    if (usdCadRate == null || !Number.isFinite(usdCadRate) || usdCadRate <= 0) {
      throw new Error('USD/CAD exchange rate is required to convert USD to CAD');
    }
    return roundToCents(amount * usdCadRate);
  }

  if (from === 'CAD' && to === 'USD') {
    if (usdCadRate == null || !Number.isFinite(usdCadRate) || usdCadRate <= 0) {
      throw new Error('USD/CAD exchange rate is required to convert CAD to USD');
    }
    return roundToCents(amount / usdCadRate);
  }

  throw new Error(`Unsupported currency conversion: ${from} → ${to}`);
}
