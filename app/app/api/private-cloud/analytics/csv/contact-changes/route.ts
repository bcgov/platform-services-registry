import { contactChangeRequests } from '@/analytics/private-cloud/contact-changes';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await contactChangeRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
