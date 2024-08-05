import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { teamApiAccountSchema, TeamApiAccountSchemaData } from '@/schema';
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
    body: teamApiAccountSchema,
  },
})(async ({ session, pathParams, body }) => {
  const res = await updateOp({ session, id: pathParams.id, roles: body.roles, users: body.users });
  return res;
});

export const DELETE = createApiHandler({
  roles: ['admin'],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const res = await deleteOp({ session, id: pathParams.id });
  return res;
});
