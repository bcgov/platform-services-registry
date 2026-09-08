import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getAnomalyQueue } from '@/services/db/public-cloud-finance';
import { financeAnomalyQuerySchema } from '@/validation-schemas/cloud-cost';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: financeAnomalyQuerySchema },
})(async ({ queryParams, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const data = await getAnomalyQueue({ includeReviewed: queryParams.includeReviewed });
  return OkResponse(data);
});
