import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchUsersWithRoles } from '@/services/db';
import { userSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
  validations: { body: userSearchBodySchema },
})(async ({ body }) => {
  const result = await searchUsersWithRoles(body);
  return OkResponse(result);
});
