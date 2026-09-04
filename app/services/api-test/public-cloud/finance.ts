import { POST as reviewFinanceAnomaly } from '@/app/api/public-cloud/finance/anomalies/[id]/review/route';
import { POST as ingestFinanceLines } from '@/app/api/public-cloud/finance/ingest/lines/route';
import { POST as resolveFinanceUnmatched } from '@/app/api/public-cloud/finance/unmatched/[id]/resolve/route';
import { GET as getProductFinanceRoute } from '@/app/api/public-cloud/products/[licencePlate]/finance/route';
import { createRoute } from '../core';

const financeRoute = createRoute('/public-cloud/finance');

export function postFinanceIngestLines(body: {
  provider: string;
  year: number;
  month: number;
  lines: Array<{ accountIdentifier: string; serviceLine: string; amount: number; currency: string }>;
}) {
  return financeRoute.post(ingestFinanceLines, '/ingest/lines', body);
}

export function postFinanceResolveUnmatched(id: string, licencePlate: string) {
  return financeRoute.post(
    resolveFinanceUnmatched,
    '/unmatched/{{id}}/resolve',
    { licencePlate },
    { pathParams: { id } },
  );
}

export function postFinanceReviewAnomaly(id: string, reviewNote: string) {
  return financeRoute.post(reviewFinanceAnomaly, '/anomalies/{{id}}/review', { reviewNote }, { pathParams: { id } });
}

const productRoute = createRoute('/public-cloud/products');

export function getProductFinance(licencePlate: string) {
  return productRoute.get(getProductFinanceRoute, '/{{licencePlate}}/finance', { pathParams: { licencePlate } });
}
