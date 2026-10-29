import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { objectId } from '@/validation-schemas';
import { teamMembersBodySchema } from '@/validation-schemas/team';
import listMembersOp from '../../_operations/list-members';
import updateMembersOp from '../../_operations/update-members';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const res = await listMembersOp({ session, id: pathParams.id });
  return res;
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: z.object({ id: objectId }), body: teamMembersBodySchema },
})(async ({ pathParams, body, session }) => {
  const res = await updateMembersOp({ session, id: pathParams.id, members: body.members });
  return res;
});
