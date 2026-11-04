import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { objectId } from '@/validation-schemas';
import { teamMemberRolesBodySchema } from '@/validation-schemas/team';
import removeMemberOp from '../../../_operations/remove-member';
import updateMemberOp from '../../../_operations/update-member';

const pathParamsSchema = z.object({ id: objectId, userId: objectId });

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: teamMemberRolesBodySchema },
})(async ({ pathParams, body, session }) => {
  const res = await updateMemberOp({ session, id: pathParams.id, userId: pathParams.userId, roles: body.roles });
  return res;
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema },
})(async ({ pathParams, session }) => {
  const res = await removeMemberOp({ session, id: pathParams.id, userId: pathParams.userId });
  return res;
});
