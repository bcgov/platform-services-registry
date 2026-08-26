import { POST as reviewFinanceAnomaly } from '@/app/api/public-cloud/finance/anomalies/[id]/review/route';
import { POST as ingestFinancePeriod } from '@/app/api/public-cloud/finance/ingest/route';
import { POST as resolveFinanceUnmatched } from '@/app/api/public-cloud/finance/unmatched/[id]/resolve/route';
import { createRoute } from '../core';

const financeRoute = createRoute('/public-cloud/finance');

export function postFinanceIngest(body: {
  provider: string;
  year: number;
  month: number;
  useSimulated?: boolean;
  licencePlates?: string[];
}) {
  return financeRoute.post(ingestFinancePeriod, '/ingest', body);
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
