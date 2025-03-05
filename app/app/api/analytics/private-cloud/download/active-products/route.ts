import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getActiveProducts } from '@/services/db/analytics/private-cloud/active-products';
import { getPrivateLicencePlates } from '@/services/db/analytics/private-cloud/licence-plates';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPrivateLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getActiveProducts({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    Date: item.date,
    'All Clusters': item['All Clusters'],
    ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'date' && key !== 'All Clusters')),
  }));

  return CsvResponse(formattedData, `analytics-private-cloud-active-products.csv`);
});
