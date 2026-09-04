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

/** Provider-fetched row before registry FX conversion. */
export type SourceBillingLine = {
  accountIdentifier: string;
  serviceLine: string;
  amount: number;
  currency: string;
  year?: number;
  month?: number;
};

export function periodKey(period: BillingPeriod) {
  return `${period.year}-${String(period.month).padStart(2, '0')}`;
}
