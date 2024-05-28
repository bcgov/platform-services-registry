import { requestDecisionTime } from '@/analytics/public-cloud/request-decision-time';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data = await requestDecisionTime();
  return CsvResponse(data, 'requst-decision-time.csv');
});
