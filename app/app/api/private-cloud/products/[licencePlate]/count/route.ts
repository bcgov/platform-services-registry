import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getCommentCountOp } from './_operations/count';

const pathParamsSchema = z.object({
  licencePlate: z.string(),
});

const queryParamsSchema = z.object({
  requestId: z.string().optional(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [GlobalPermissions.ViewAllPrivateProductComments],
  validations: {
    pathParams: pathParamsSchema,
    queryParams: queryParamsSchema,
  },
})(async ({ pathParams, queryParams }) => {
  const { licencePlate } = pathParams;
  const { requestId } = queryParams;

  const res = await getCommentCountOp(licencePlate, requestId);
  return OkResponse(res);
});
