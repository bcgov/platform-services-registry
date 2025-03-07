import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getAllRequests } from '@/services/db/analytics/public-cloud/all-requests';
import { getPublicLicencePlates } from '@/services/db/analytics/public-cloud/licence-plates';
import { analyticsPublicCloudFilterSchema } from '@/validation-schemas/analytics-public-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  validations: { body: analyticsPublicCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPublicLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getAllRequests({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    Date: item.date,
    'All Requests': item['All requests'],
    'Edit Requests': item['Edit requests'],
    'Create Requests': item['Create requests'],
    'Delete Requests': item['Delete requests'],
  }));

  return CsvResponse(formattedData, `analytics-public-cloud-users-with quota-change-requests.csv`);
});
