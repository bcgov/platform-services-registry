import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { privateCloudUnitPriceBodySchema } from '@/validation-schemas/private-cloud';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPrivateCloudUnitPrices],
  validations: {
    pathParams: getPathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const response = await readOp({ session, pathParams });
  return response;
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManagePrivateCloudUnitPrices],
  validations: {
    pathParams: putPathParamSchema,
    body: privateCloudUnitPriceBodySchema,
  },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, pathParams, body });
  return response;
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManagePrivateCloudUnitPrices],
  validations: {
    pathParams: deletePathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const response = await deleteOp({ session, pathParams });
  return response;
});
