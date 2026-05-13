import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { attachTeamToSystem, detachTeamFromSystem, getSystem } from '@/services/db/system';
import { objectId } from '@/validation-schemas';
import { linkTeamBodySchema } from '@/validation-schemas/system';

const pathParamsSchema = z.object({
  id: objectId,
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkTeamBodySchema },
})(async ({ session, pathParams, body }) => {
  await attachTeamToSystem(pathParams.id, body.teamId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkTeamBodySchema },
})(async ({ session, pathParams, body }) => {
  await detachTeamFromSystem(pathParams.id, body.teamId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});
