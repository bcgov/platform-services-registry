import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { attachPublicCloudProductToSystem, detachPublicCloudProductFromSystem, getSystem } from '@/services/db/system';
import { objectId } from '@/validation-schemas';
import { linkPublicCloudProductBodySchema } from '@/validation-schemas/system';

const pathParamsSchema = z.object({
  id: objectId,
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkPublicCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await attachPublicCloudProductToSystem(pathParams.id, body.publicCloudProductId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkPublicCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await detachPublicCloudProductFromSystem(pathParams.id, body.publicCloudProductId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});
