import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getPlatformForecastSummary } from '@/services/db/public-cloud-forecast';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
})(async ({ session }) => {
  const summary = await getPlatformForecastSummary({
    includeActuals: session.previews.publicCloudFinance,
  });
  return OkResponse(summary);
});
