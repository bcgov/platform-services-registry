import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getTeam, updateTeamMembers } from '@/services/db/team';
import { objectId } from '@/validation-schemas';
import { updateMembersBodySchema } from '@/validation-schemas/team';

const pathParamsSchema = z.object({
  id: objectId,
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: updateMembersBodySchema },
})(async ({ session, pathParams, body }) => {
  const res = await updateTeamMembers(pathParams.id, body.members, session);
  return OkResponse(res);
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const res = await getTeam(pathParams.id, session);
  return OkResponse(res?.members ?? []);
});
