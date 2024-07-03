import { quotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await quotaEditRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
