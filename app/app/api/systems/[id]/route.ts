import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { archiveSystem, getSystem, updateSystem } from '@/services/db/system';
import { objectId } from '@/validation-schemas';
import { systemBodySchema } from '@/validation-schemas/system';

const pathParamsSchema = z.object({
  id: objectId,
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewSystems],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const res = await getSystem(pathParams.id, session);
  if (!res) return NotFoundResponse('System not found');
  return OkResponse(res);
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: systemBodySchema },
})(async ({ session, pathParams, body }) => {
  const res = await updateSystem(pathParams.id, session, body);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema },
})(async ({ session, pathParams }) => {
  const res = await archiveSystem(pathParams.id, session);
  return OkResponse(res);
});
