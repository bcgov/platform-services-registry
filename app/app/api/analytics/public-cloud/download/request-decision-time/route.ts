import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getPublicLicencePlates } from '@/services/db/analytics/public-cloud/licence-plates';
import { getRequestDecisionTime } from '@/services/db/analytics/public-cloud/request-decision-time';
import { analyticsPublicCloudFilterSchema } from '@/validation-schemas/analytics-public-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  validations: { body: analyticsPublicCloudFilterSchema },
})(async ({ session, body }) => {
  const licencePlatesList = await getPublicLicencePlates(body);
  const dateFilter =
    body.dates?.length === 2 ? { createdAt: { gte: new Date(body.dates[0]), lte: new Date(body.dates[1]) } } : {};
  const data = await getRequestDecisionTime({ licencePlatesList, dateFilter });

  if (!data) return NoContent();

  const formattedData = data.map((item) => ({
    'Time Interval': item.time,
    Percentage: `${item.percentage.toFixed(2)}%`,
  }));

  return CsvResponse(formattedData, `analytics-public-cloud-request-decision-time.csv`);
});
