import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getContactChangeRequests } from '@/services/db/analytics/public-cloud/contact-changes';
import { getPublicLicencePlates } from '@/services/db/analytics/public-cloud/licence-plates';
import { analyticsPublicCloudFilterSchema } from '@/validation-schemas/analytics-public-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  validations: { body: analyticsPublicCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPublicLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getContactChangeRequests({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    Date: item.date,
    'Contact Changes': item['Contact changes'],
  }));

  return CsvResponse(formattedData, `analytics-public-cloud-contact-change-requests.csv`);
});
