import { Provider } from '@/prisma/client';
import { convertCurrencyAmount, type CurrencyCode } from '@/services/exchange-rates';
import { ensureMonthlyUsdCadRate } from '@/services/public-cloud-finance/monthly-fx-rate';
import type { BillingPeriod, NormalizedBillingLine, SourceBillingLine } from './types';

type FxContext = { rate: number; rateDate: Date };

function toCad(
  amount: number,
  currency: string | undefined,
  fx: FxContext | null,
): { amountCad: number; fxRate?: number; fxRateDate?: Date } {
  const sourceCurrency = (currency ?? 'CAD').toUpperCase();
  if (sourceCurrency !== 'CAD' && sourceCurrency !== 'USD') {
    throw new Error(`Unsupported billing currency: ${sourceCurrency}`);
  }
  if (sourceCurrency === 'CAD') {
    return { amountCad: convertCurrencyAmount(amount, 'CAD', 'CAD') };
  }
  if (!fx) {
    throw new Error('USD→CAD conversion requires a month-end FX rate from Bank of Canada');
  }
  return {
    amountCad: convertCurrencyAmount(amount, 'USD' satisfies CurrencyCode, 'CAD', fx.rate),
    fxRate: fx.rate,
    fxRateDate: fx.rateDate,
  };
}

async function resolvePeriodFx(period: BillingPeriod, rows: SourceBillingLine[]): Promise<FxContext | null> {
  const needsUsd = rows.some((row) => (row.currency ?? 'CAD').toUpperCase() !== 'CAD');
  if (!needsUsd) return null;
  const stored = await ensureMonthlyUsdCadRate(period.year, period.month);
  return { rate: stored.rate, rateDate: stored.rateDate };
}

/** Filter, convert to CAD, and drop zero-amount lines. */
export async function normalizeSourceLines(
  rows: SourceBillingLine[],
  provider: Provider,
  period: BillingPeriod,
): Promise<NormalizedBillingLine[]> {
  const filtered = rows.filter(
    (row) => (!row.year || row.year === period.year) && (!row.month || row.month === period.month),
  );
  const fx = await resolvePeriodFx(period, filtered);

  return filtered
    .map((row) => {
      const cad = toCad(row.amount, row.currency, fx);
      return {
        provider,
        accountIdentifier: row.accountIdentifier,
        serviceLine: row.serviceLine,
        year: period.year,
        month: period.month,
        amountCad: cad.amountCad,
        sourceCurrency: row.currency ?? 'CAD',
        fxRate: cad.fxRate,
        fxRateDate: cad.fxRateDate,
      };
    })
    .filter((row) => row.amountCad !== 0);
}
