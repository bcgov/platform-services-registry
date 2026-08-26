import { Provider } from '@/prisma/client';

export type BillingPeriod = {
  year: number;
  month: number;
};

export type NormalizedBillingLine = {
  provider: Provider;
  accountIdentifier: string;
  serviceLine: string;
  year: number;
  month: number;
  amountCad: number;
  sourceCurrency: string;
  fxRate?: number;
  fxRateDate?: Date;
};

export type BillingFetchScope = {
  /** Limit to these licence plates (resolved to account IDs by the caller/ingest). */
  licencePlates?: string[];
  /** Limit to these account / subscription identifiers. */
  accountIdentifiers?: string[];
};

export type BillingSource = {
  name: string;
  fetchBillingLines: (period: BillingPeriod, scope?: BillingFetchScope) => Promise<NormalizedBillingLine[]>;
};

export function periodKey(period: BillingPeriod) {
  return `${period.year}-${String(period.month).padStart(2, '0')}`;
}

/** Inclusive month start + exclusive next-month start, plus last calendar day. */
export function periodBounds(period: BillingPeriod) {
  const start = `${period.year}-${String(period.month).padStart(2, '0')}-01`;
  const endMonth = period.month === 12 ? 1 : period.month + 1;
  const endYear = period.month === 12 ? period.year + 1 : period.year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  const endInclusive = new Date(Date.UTC(endYear, endMonth - 1, 0));
  const endDay = `${period.year}-${String(period.month).padStart(2, '0')}-${String(endInclusive.getUTCDate()).padStart(
    2,
    '0',
  )}`;
  return { start, end, endDay };
}
