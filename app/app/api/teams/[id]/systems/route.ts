import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { attachSystemToTeam, detachSystemFromTeam, getTeam } from '@/services/db/team';
import { objectId } from '@/validation-schemas';
import { linkSystemBodySchema } from '@/validation-schemas/team';

const pathParamsSchema = z.object({
  id: objectId,
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: linkSystemBodySchema },
})(async ({ session, pathParams, body }) => {
  await attachSystemToTeam(pathParams.id, body.systemId);
  const res = await getTeam(pathParams.id, session);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: linkSystemBodySchema },
})(async ({ session, pathParams, body }) => {
  await detachSystemFromTeam(pathParams.id, body.systemId);
  const res = await getTeam(pathParams.id, session);
  return OkResponse(res);
});
