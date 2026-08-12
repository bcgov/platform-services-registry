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
