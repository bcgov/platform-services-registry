import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchBilling } from '@/services/db/billing';
import { billingSearchBodySchema } from '@/validation-schemas/billing';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewBilling],
  validations: { body: billingSearchBodySchema },
})(async ({ body }) => {
  const result = await searchBilling(body);
  return OkResponse(result);
});
