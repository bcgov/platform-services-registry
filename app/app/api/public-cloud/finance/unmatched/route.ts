import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getUnmatchedBilling, type ProviderFilter } from '@/services/db/public-cloud-finance';
import { financeProviderQuerySchema } from '@/validation-schemas/cloud-cost';

const querySchema = financeProviderQuerySchema.extend({
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: querySchema },
})(async ({ queryParams, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const data = await getUnmatchedBilling({
    provider: queryParams.provider as ProviderFilter,
    year: queryParams.year,
    month: queryParams.month,
  });
  return OkResponse(data);
});
