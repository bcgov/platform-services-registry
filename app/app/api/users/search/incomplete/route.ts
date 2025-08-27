import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { fixUsersMissingIdirGuid } from '@/services/db';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
})(async () => {
  const result = await fixUsersMissingIdirGuid();
  return OkResponse(result);
});
