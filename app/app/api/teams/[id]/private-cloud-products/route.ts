import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { attachPrivateCloudProductToTeam, detachPrivateCloudProductFromTeam, getTeam } from '@/services/db/team';
import { objectId } from '@/validation-schemas';
import { linkPrivateCloudProductBodySchema } from '@/validation-schemas/team';

const pathParamsSchema = z.object({
  id: objectId,
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: linkPrivateCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await attachPrivateCloudProductToTeam(pathParams.id, body.privateCloudProductId);
  const res = await getTeam(pathParams.id, session);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { pathParams: pathParamsSchema, body: linkPrivateCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await detachPrivateCloudProductFromTeam(pathParams.id, body.privateCloudProductId);
  const res = await getTeam(pathParams.id, session);
  return OkResponse(res);
});
