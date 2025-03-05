import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getPrivateLicencePlates } from '@/services/db/analytics/private-cloud/licence-plates';
import { usersWithQuotaEditRequests } from '@/services/db/analytics/private-cloud/users-quota-change';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPrivateLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};

  const data = await usersWithQuotaEditRequests({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    UserID: item.id,
    CreatedAt: item.createdAt,
    UpdatedAt: item.updatedAt,
    Ministry: item.ministry ?? 'N/A',
    ProviderUserID: item.providerUserId ?? 'N/A',
    FirstName: item.firstName ?? 'N/A',
    LastName: item.lastName ?? 'N/A',
    Email: item.email ?? 'N/A',
    LastSeen: item.lastSeen ?? 'N/A',
  }));

  return CsvResponse(formattedData, `analytics-private-cloud-users-with quota-change-requests.csv`);
});
