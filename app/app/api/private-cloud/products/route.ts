import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { privateCloudCreateRequestBodySchema } from '@/validation-schemas/private-cloud';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: privateCloudCreateRequestBodySchema },
})(async ({ session, body }) => {
  const res = await createOp({ session, body });
  return res;
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {},
})(async ({ session }) => {
  const data = await listOp({ session });
  return OkResponse(data);
});
