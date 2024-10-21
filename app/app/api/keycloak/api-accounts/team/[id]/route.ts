import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { teamApiAccountSchema } from '@/validation-schemas/api-accounts';
import deleteOp from '../_operations/delete';
import getOp from '../_operations/read';
import updateOp from '../_operations/update';

const pathParamSchema = z.object({
  id: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const res = await getOp({ session, id: pathParams.id });
  return res;
});

export const PUT = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: {
    pathParams: pathParamSchema,
    body: teamApiAccountSchema,
  },
})(async ({ session, pathParams, body }) => {
  const res = await updateOp({ session, id: pathParams.id, name: body.name, roles: body.roles, users: body.users });
  return res;
});

export const DELETE = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const res = await deleteOp({ session, id: pathParams.id });
  return res;
});
