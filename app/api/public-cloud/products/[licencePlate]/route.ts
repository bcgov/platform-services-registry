import createApiHandler from '@/core/api-handler';
import { PublicCloudEditRequestBodySchema } from '@/schema';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import deleteOp from '../_operations/delete';
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
  validations: { pathParams: putPathParamSchema, body: PublicCloudEditRequestBodySchema },
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
