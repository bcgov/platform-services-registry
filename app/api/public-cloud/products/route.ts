import { PublicCloudCreateRequestBodySchema } from '@/schema';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const POST = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.CreatePublicCloudProducts],
  validations: { body: PublicCloudCreateRequestBodySchema },
})(async ({ session, body }) => {
  const res = await createOp({ session, body });
  return res;
});

export const GET = createApiHandler({
  roles: ['user'],
  validations: {},
})(async ({ session }) => {
  const data = await listOp({ session });
  return OkResponse(data);
});
