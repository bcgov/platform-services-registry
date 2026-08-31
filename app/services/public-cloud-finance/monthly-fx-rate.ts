import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { fetchUsdCadExchangeRateForMonth } from '@/services/bank-of-canada/usd-cad-rate';
import { isUniqueConstraintError } from '@/services/public-cloud-finance/ingest/ingest-errors';

export const USD_CAD_PAIR = 'USD_CAD';

export type StoredMonthlyFxRate = {
  pair: string;
  year: number;
  month: number;
  rate: number;
  rateDate: Date;
  source: string;
};

function parseObservationDate(date: string): Date {
  // BoC dates are YYYY-MM-DD (UTC calendar day).
  return new Date(`${date}T00:00:00.000Z`);
}

function toStored(row: {
  pair: string;
  year: number;
  month: number;
  rate: number;
  rateDate: Date;
  source: string;
}): StoredMonthlyFxRate {
  return {
    pair: row.pair,
    year: row.year,
    month: row.month,
    rate: row.rate,
    rateDate: row.rateDate,
    source: row.source,
  };
}

async function upsertMonthlyUsdCadRate(data: {
  year: number;
  month: number;
  rate: number;
  rateDate: Date;
  source: string;
}): Promise<StoredMonthlyFxRate> {
  const where = { pair_year_month: { pair: USD_CAD_PAIR, year: data.year, month: data.month } };
  try {
    const row = await prisma.monthlyFxRate.upsert({
      where,
      create: {
        pair: USD_CAD_PAIR,
        year: data.year,
        month: data.month,
        rate: data.rate,
        rateDate: data.rateDate,
        source: data.source,
      },
      update:
        data.source === 'FINANCE_USD_CAD_RATE'
          ? {}
          : {
              rate: data.rate,
              rateDate: data.rateDate,
              source: data.source,
            },
    });
    return toStored(row);
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const existing = await prisma.monthlyFxRate.findUnique({ where });
    if (existing) return toStored(existing);
    throw error;
  }
}

/** True when the stored observation is late enough in the month to treat as invoice-close. */
export function isLikelyMonthEndFxRate(rateDate: Date, year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return (
    rateDate.getUTCFullYear() === year && rateDate.getUTCMonth() + 1 === month && rateDate.getUTCDate() >= lastDay - 3
  );
}

export function shouldReuseStoredUsdCadRate(
  existing: { source: string; rateDate: Date } | null,
  year: number,
  month: number,
  now = new Date(),
) {
  if (!existing || existing.source === 'FINANCE_USD_CAD_RATE') return false;
  const openMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  if (openMonth) return false;
  return isLikelyMonthEndFxRate(existing.rateDate, year, month);
}

/**
 * Ensure a USD/CAD rate is persisted for conversion.
 * Reuses a month-end Bank of Canada row for closed months. Refetches for the
 * open month (MTD) and when a stored rate is still mid-month after close.
 */
export async function ensureMonthlyUsdCadRate(year: number, month: number): Promise<StoredMonthlyFxRate> {
  const existing = await prisma.monthlyFxRate.findUnique({
    where: { pair_year_month: { pair: USD_CAD_PAIR, year, month } },
  });

  if (existing && shouldReuseStoredUsdCadRate(existing, year, month)) {
    return toStored(existing);
  }

  try {
    const boc = await fetchUsdCadExchangeRateForMonth(year, month);
    return upsertMonthlyUsdCadRate({
      year,
      month,
      rate: boc.rate,
      rateDate: parseObservationDate(boc.date),
      source: boc.source,
    });
  } catch (error) {
    if (existing) return toStored(existing);
    const fallback = Number(process.env.FINANCE_USD_CAD_RATE);
    if (Number.isFinite(fallback) && fallback > 0) {
      logger.warn(
        `Bank of Canada FX unavailable for ${year}-${month}; using FINANCE_USD_CAD_RATE fallback for ingest: ${String(
          error,
        )}`,
      );
      return upsertMonthlyUsdCadRate({
        year,
        month,
        rate: fallback,
        rateDate: new Date(Date.UTC(year, month, 0)),
        source: 'FINANCE_USD_CAD_RATE',
      });
    }

    throw error;
  }
}
