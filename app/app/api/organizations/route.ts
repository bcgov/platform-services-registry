import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { organizationBodySchema } from '@/validation-schemas/organization';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const POST = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  validations: { body: organizationBodySchema },
})(async ({ session, body }) => {
  const res = await createOp({ session, body });
  return res;
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {},
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});
