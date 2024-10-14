import { contactChangeRequests } from '@/analytics/public-cloud/contact-changes';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await contactChangeRequests();
  return CsvResponse(data, 'quota-requests.csv');
});
