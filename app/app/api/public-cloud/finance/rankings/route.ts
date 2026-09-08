import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getFinanceRankings, type ProviderFilter } from '@/services/db/public-cloud-finance';
import { financeRankingsQuerySchema } from '@/validation-schemas/cloud-cost';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: financeRankingsQuerySchema },
})(async ({ queryParams, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const data = await getFinanceRankings({
    provider: queryParams.provider as ProviderFilter,
    organizationId: queryParams.organizationId,
    period: queryParams.period,
    limit: queryParams.limit,
  });
  return OkResponse(data);
});
