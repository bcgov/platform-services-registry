import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { privateCloudEditRequestBodySchema } from '@/validation-schemas/private-cloud';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await readOp({ session, pathParams });
  return response;
});

export const PUT = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: putPathParamSchema, body: privateCloudEditRequestBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});

export const DELETE = createApiHandler({
  roles: ['user', 'service-account admin', 'service-account private-admin'],
  useServiceAccount: true,
  validations: { pathParams: deletePathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await deleteOp({ session, pathParams });
  return response;
});
