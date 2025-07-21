import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { objectId } from '@/validation-schemas';
import { organizationBodySchema } from '@/validation-schemas/organization';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const { id } = pathParams;
  const res = await readOp({ session, id });
  return res;
});

export const PUT = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  validations: { pathParams: z.object({ id: objectId }), body: organizationBodySchema },
})(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const res = await updateOp({ session, id, body });
  return res;
});

export const DELETE = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const { id } = pathParams;
  const res = await deleteOp({ session, id });
  return res;
});
