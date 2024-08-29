import createApiHandler from '@/core/api-handler';
import { teamApiAccountSchema } from '@/validation-schemas/api-accounts';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const GET = createApiHandler({
  roles: ['user'],
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});

export const POST = createApiHandler({
  roles: ['admin'],
  validations: {
    body: teamApiAccountSchema,
  },
})(async ({ session, body }) => {
  const res = await createOp({ session, roles: body.roles, users: body.users });
  return res;
});
