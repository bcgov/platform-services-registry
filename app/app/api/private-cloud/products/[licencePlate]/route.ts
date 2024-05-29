import createApiHandler from '@/core/api-handler';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

export const GET = createApiHandler({
  roles: ['user'],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await readOp({ session, pathParams });
  return response;
});

export const PUT = createApiHandler({
  roles: ['user'],
  validations: { pathParams: putPathParamSchema, body: PrivateCloudEditRequestBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});

export const DELETE = createApiHandler({
  roles: ['user'],
  validations: { pathParams: deletePathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await deleteOp({ session, pathParams });
  return response;
});
