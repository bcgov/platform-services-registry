import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getForecastCoverageChaseList } from '@/services/db/public-cloud-finance';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
})(async ({ session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const data = await getForecastCoverageChaseList();
  return OkResponse({ products: data });
});
