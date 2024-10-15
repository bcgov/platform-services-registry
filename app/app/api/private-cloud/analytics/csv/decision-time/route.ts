import { requestDecisionTime } from '@/analytics/private-cloud/request-decision-time';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await requestDecisionTime();
  return CsvResponse(data, 'requst-decision-time.csv');
});
