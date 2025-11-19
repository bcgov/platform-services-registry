import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { privateCloudAdminUpdateBodySchema } from '@/validation-schemas/private-cloud';
import updateOp from '../_operations/update';
import { putPathParamSchema } from './schema';

export const PUT = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  validations: { pathParams: putPathParamSchema, body: privateCloudAdminUpdateBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});
