import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getContactChangeRequests } from '@/services/db/analytics-private-cloud/contact-changes';
import { getPrivateLicencePlates } from '@/services/db/analytics-private-cloud/licencePlates';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPrivateLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getContactChangeRequests({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    Date: item.date,
    'Contact Changes': item['Contact changes'],
  }));

  return CsvResponse(formattedData, `analytics-private-cloud-contact-change-requests.csv`);
});
