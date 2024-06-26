import { combinedRequests } from '@/analytics/public-cloud/requests';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPublicAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await combinedRequests();
  return CsvResponse(data, 'requests.csv');
});
