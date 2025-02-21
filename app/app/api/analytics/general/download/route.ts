import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { filterAnalyticsGeneral } from '@/services/db/analytics-general-logins';
import { formatDate } from '@/utils/js';
import { analyticsGeneralFilterSchema } from '@/validation-schemas/analytics-general';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  validations: { body: analyticsGeneralFilterSchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
  };

  const data = await filterAnalyticsGeneral(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((event) => ({
    Date: formatDate(event.date),
    'Number of Logins': event.Logins,
  }));

  return CsvResponse(formattedData, 'analytics-general.csv');
});
