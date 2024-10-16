import { usersWithQuotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await usersWithQuotaEditRequests();
  const formatted = data.map((user) => ({
    'First name': user?.firstName,
    'Last name': user?.lastName,
    Email: user?.email,
    Ministry: user?.ministry,
  }));

  return CsvResponse(formatted, 'quota-requests.csv');
});
