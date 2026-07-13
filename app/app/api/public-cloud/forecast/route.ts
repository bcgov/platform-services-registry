import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getPlatformForecastSummary } from '@/services/db/public-cloud-forecast';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
})(async () => {
  const summary = await getPlatformForecastSummary();
  return OkResponse(summary);
});
