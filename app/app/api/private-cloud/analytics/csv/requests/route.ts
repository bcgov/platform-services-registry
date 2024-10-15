import { combinedRequests } from '@/analytics/private-cloud/requests';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await combinedRequests();
  return CsvResponse(data, 'requests.csv');
});
