import { startOfDay, endOfDay } from 'date-fns';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getAnalyticsGeneral } from '@/services/db/analytics-general-logins';
import { analyticsGeneralFilterSchema, AnalyticsGeneralFilterBody } from '@/validation-schemas/analytics-general';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  validations: { body: analyticsGeneralFilterSchema },
})(async ({ session, body }) => {
  const searchProps: AnalyticsGeneralFilterBody = { ...body };

  if (body.dates.length === 2) {
    searchProps.dates = [
      startOfDay(new Date(body.dates[0])).toISOString(),
      endOfDay(new Date(body.dates[1])).toISOString(),
    ];
  }

  const data = await getAnalyticsGeneral(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((event) => ({
    Date: event.date,
    'Number of Logins': event.Logins,
  }));

  return CsvResponse(formattedData, 'analytics-general.csv');
});
