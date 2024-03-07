import createApiHandler from '@/core/api-handler';
import { quotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data = await quotaEditRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
