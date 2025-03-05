import { startOfDay, endOfDay } from 'date-fns';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getAnalyticsGeneral } from '@/services/db/analytics-general-logins';
import { analyticsGeneralFilterSchema } from '@/validation-schemas/analytics-general';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  validations: { body: analyticsGeneralFilterSchema },
})(async ({ body }) => {
  const adjustedBody = { ...body };

  if (body.dates.length === 2) {
    adjustedBody.dates = [
      startOfDay(new Date(body.dates[0])).toISOString(),
      endOfDay(new Date(body.dates[1])).toISOString(),
    ];
  }

  const result = await getAnalyticsGeneral(adjustedBody);

  return OkResponse(result);
});
