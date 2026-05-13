import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import {
  attachPrivateCloudProductToSystem,
  detachPrivateCloudProductFromSystem,
  getSystem,
} from '@/services/db/system';
import { objectId } from '@/validation-schemas';
import { linkPrivateCloudProductBodySchema } from '@/validation-schemas/system';

const pathParamsSchema = z.object({
  id: objectId,
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkPrivateCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await attachPrivateCloudProductToSystem(pathParams.id, body.privateCloudProductId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});

export const DELETE = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { pathParams: pathParamsSchema, body: linkPrivateCloudProductBodySchema },
})(async ({ session, pathParams, body }) => {
  await detachPrivateCloudProductFromSystem(pathParams.id, body.privateCloudProductId);
  const res = await getSystem(pathParams.id, session);
  return OkResponse(res);
});
