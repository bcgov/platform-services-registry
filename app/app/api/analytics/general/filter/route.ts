import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { filterAnalyticsGeneral } from '@/services/db/analytics-general-logins';
import { analyticsGeneralFilterSchema } from '@/validation-schemas/analytics-general';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  validations: { body: analyticsGeneralFilterSchema },
})(async ({ body }) => {
  const result = await filterAnalyticsGeneral(body);
  return OkResponse(result);
});
