import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getPrivateLicencePlates } from '@/services/db/analytics-private-cloud/licencePlates';
import { getRequestDecisionTime } from '@/services/db/analytics-private-cloud/request-decision-time';
import { analyticsPrivateCloudFilterSchema } from '@/validation-schemas/analytics-private-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  validations: { body: analyticsPrivateCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPrivateLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getRequestDecisionTime({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    'Time Interval': item.time,
    Percentage: item.Percentage,
  }));

  return CsvResponse(formattedData, `analytics-private-cloud-request-decision-time.csv`);
});
