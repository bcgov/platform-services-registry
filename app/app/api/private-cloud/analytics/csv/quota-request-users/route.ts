import { usersWithQuotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import createApiHandler from '@/core/api-handler';
import { CsvResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewPrivateAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await usersWithQuotaEditRequests();
  const formatted = data.map((user) => ({
    'First Name': user?.firstName,
    'Last Name': user?.lastName,
    Email: user?.email,
    Ministry: user?.ministry,
  }));

  return CsvResponse(formatted, 'quota-requests.csv');
});
