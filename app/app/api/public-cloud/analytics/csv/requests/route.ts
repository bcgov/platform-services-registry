import { combinedRequests } from '@/analytics/public-cloud/requests';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await combinedRequests();
  return CsvResponse(data, 'requests.csv');
});
