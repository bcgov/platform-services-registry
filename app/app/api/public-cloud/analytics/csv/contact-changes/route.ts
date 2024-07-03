import { contactChangeRequests } from '@/analytics/public-cloud/contact-changes';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPublicAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await contactChangeRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
