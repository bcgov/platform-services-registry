import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getPublicCloudAnalytics } from '@/services/db/analytics/public-cloud';
import { analyticsPublicCloudFilterSchema } from '@/validation-schemas/analytics-public-cloud';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  validations: { body: analyticsPublicCloudFilterSchema },
})(async ({ body }) => {
  const result = await getPublicCloudAnalytics(body);
  return OkResponse(result);
});
