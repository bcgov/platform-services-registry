import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import listOp from './_operations/list';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateCloudUnitPrices],
  validations: {},
})(async ({ session }) => {
  const data = await listOp({ session });
  return OkResponse(data);
});
