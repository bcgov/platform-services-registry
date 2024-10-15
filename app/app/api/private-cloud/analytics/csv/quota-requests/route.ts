import { quotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await quotaEditRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
