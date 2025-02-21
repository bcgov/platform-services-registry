import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { userUpdateBodySchema } from '@/validation-schemas';
import updateOp from '../_operations/update';
import { putPathParamSchema } from './schema';

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.EditUserRoles, GlobalPermissions.EditUserOnboardingDate],
  validations: { pathParams: putPathParamSchema, body: userUpdateBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});
