import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { organizationBodySchema } from '@/validation-schemas/organization';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageOrganizations],
  validations: { body: organizationBodySchema },
})(async ({ session, body }) => {
  const res = await createOp({ session, body });
  return res;
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewOrganizations],
  validations: {},
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});
