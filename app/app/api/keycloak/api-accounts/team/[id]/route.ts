import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import deleteOp from '../_operations/delete';
import getOp from '../_operations/read';
import updateOp from '../_operations/update';

const pathParamSchema = z.object({
  id: z.string(),
});

export const GET = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const res = await getOp({ session, id: pathParams.id });
  return res;
});

export const PUT = createApiHandler({
  roles: ['admin'],
  validations: {
    pathParams: pathParamSchema,
    body: z.object({
      roles: z.string().array(),
    }),
  },
})(async ({ session, pathParams, body }) => {
  const res = await updateOp({ session, id: pathParams.id, roles: body.roles });
  return res;
});

export const DELETE = createApiHandler({
  roles: ['admin'],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const res = await deleteOp({ session, id: pathParams.id });
  return res;
});
