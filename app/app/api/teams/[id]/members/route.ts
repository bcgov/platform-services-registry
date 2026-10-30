import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { objectId } from '@/validation-schemas';
import { teamMemberBodySchema } from '@/validation-schemas/team';
import addMemberOp from '../../_operations/add-member';
import listMembersOp from '../../_operations/list-members';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: z.object({ id: objectId }) },
})(async ({ pathParams, session }) => {
  const res = await listMembersOp({ session, id: pathParams.id });
  return res;
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: z.object({ id: objectId }), body: teamMemberBodySchema },
})(async ({ pathParams, body, session }) => {
  const res = await addMemberOp({ session, id: pathParams.id, body });
  return res;
});
