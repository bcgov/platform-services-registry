import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { archiveTeam, getTeam, updateTeam } from '@/services/db/team';
import { objectId } from '@/validation-schemas';
import { teamBodySchema } from '@/validation-schemas/team';

const pathParamsSchema = z.object({
  id: objectId,
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const res = await getTeam(pathParams.id, session);
  if (!res) return NotFoundResponse('Team not found');
  return OkResponse(res);
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: teamBodySchema },
})(async ({ session, pathParams, body }) => {
  const res = await updateTeam(pathParams.id, session, body);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const res = await archiveTeam(pathParams.id, session);
  return OkResponse(res);
});
