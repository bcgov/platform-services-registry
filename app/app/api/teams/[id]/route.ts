import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { objectId } from '@/validation-schemas';
import { teamBodySchema } from '@/validation-schemas/team';
import archiveOp from '../_operations/archive';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const res = await readOp({ session, id: pathParams.id });
  return res;
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: z.object({ id: objectId }), body: teamBodySchema },
})(async ({ pathParams, body, session }) => {
  const res = await updateOp({ session, id: pathParams.id, body });
  return res;
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const res = await archiveOp({ session, ids: [pathParams.id] });
  return res;
});
