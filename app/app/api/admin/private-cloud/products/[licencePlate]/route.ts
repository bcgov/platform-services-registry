import createApiHandler from '@/core/api-handler';
import { privateCloudAdminUpdateBodySchema } from '@/schema';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

export const PUT = createApiHandler({
  roles: ['admin'],
  validations: { pathParams: putPathParamSchema, body: privateCloudAdminUpdateBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});
