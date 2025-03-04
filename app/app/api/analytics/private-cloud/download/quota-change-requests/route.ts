import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getPrivateLicencePlates } from '@/services/db/analytics-private-cloud/licencePlates';
import { getQuotaChangeRequests } from '@/services/db/analytics-private-cloud/quota-change';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPrivateLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getQuotaChangeRequests({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    Date: item.date,
    'All Quota Requests': item['All quota requests'],
    'Approved Quota Requests': item['Approved quota requests'],
    'Rejected Quota Requests': item['Rejected quota requests'],
  }));

  return CsvResponse(formattedData, `analytics-private-cloud-quota-change-requests.csv`);
});
