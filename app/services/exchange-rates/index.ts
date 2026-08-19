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

/** Convert an amount between supported currencies. Zero amounts skip FX. */
export function convertCurrencyAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  usdCadRate?: number,
): number {
  if (from === to) return amount;
  if (amount === 0) return 0;

  const rounded = Math.round(amount);

  if (from === 'USD' && to === 'CAD') {
    if (usdCadRate == null || !Number.isFinite(usdCadRate) || usdCadRate <= 0) {
      throw new Error('USD/CAD exchange rate is required to convert USD to CAD');
    }
    return Math.round(rounded * usdCadRate);
  }

  if (from === 'CAD' && to === 'USD') {
    if (usdCadRate == null || !Number.isFinite(usdCadRate) || usdCadRate <= 0) {
      throw new Error('USD/CAD exchange rate is required to convert CAD to USD');
    }
    return Math.round(rounded / usdCadRate);
  }

  throw new Error(`Unsupported currency conversion: ${from} → ${to}`);
}
