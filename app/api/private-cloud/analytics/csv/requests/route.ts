import createApiHandler from '@/core/api-handler';
import { combinedRequests } from '@/analytics/private-cloud/requests';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  roles: ['user'],
});

export const GET = apiHandler(async () => {
  const data = await combinedRequests();
  return CsvResponse(data, 'requests.csv');
});
