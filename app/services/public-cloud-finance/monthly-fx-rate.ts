import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { fetchUsdCadExchangeRateForMonth } from '@/services/bank-of-canada/usd-cad-rate';

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

/**
 * Ensure a month-end USD/CAD rate is persisted for invoice conversion.
 * Reuses an existing MonthlyFxRate row; otherwise fetches Bank of Canada Valet
 * for the calendar month and stores the last observation.
 */
export async function ensureMonthlyUsdCadRate(year: number, month: number): Promise<StoredMonthlyFxRate> {
  const existing = await prisma.monthlyFxRate.findUnique({
    where: { pair_year_month: { pair: USD_CAD_PAIR, year, month } },
  });

  if (existing) {
    return {
      pair: existing.pair,
      year: existing.year,
      month: existing.month,
      rate: existing.rate,
      rateDate: existing.rateDate,
      source: existing.source,
    };
  }

  try {
    const boc = await fetchUsdCadExchangeRateForMonth(year, month);
    const rateDate = parseObservationDate(boc.date);
    const created = await prisma.monthlyFxRate.create({
      data: {
        pair: USD_CAD_PAIR,
        year,
        month,
        rate: boc.rate,
        rateDate,
        source: boc.source,
      },
    });

    return {
      pair: created.pair,
      year: created.year,
      month: created.month,
      rate: created.rate,
      rateDate: created.rateDate,
      source: created.source,
    };
  } catch (error) {
    const fallback = Number(process.env.FINANCE_USD_CAD_RATE);
    if (Number.isFinite(fallback) && fallback > 0) {
      logger.warn(
        `Bank of Canada FX unavailable for ${year}-${month}; using FINANCE_USD_CAD_RATE fallback for ingest: ${String(
          error,
        )}`,
      );
      const rateDate = new Date(Date.UTC(year, month, 0));
      const created = await prisma.monthlyFxRate.create({
        data: {
          pair: USD_CAD_PAIR,
          year,
          month,
          rate: fallback,
          rateDate,
          source: 'FINANCE_USD_CAD_RATE',
        },
      });
      return {
        pair: created.pair,
        year: created.year,
        month: created.month,
        rate: created.rate,
        rateDate: created.rateDate,
        source: created.source,
      };
    }

    throw error;
  }
}
