import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getFinanceSnapshot, type ProviderFilter } from '@/services/db/public-cloud-finance';
import { financeProviderQuerySchema } from '@/validation-schemas/cloud-cost';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: financeProviderQuerySchema },
})(async ({ queryParams, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const data = await getFinanceSnapshot(queryParams.provider as ProviderFilter);
  return OkResponse(data);
});
