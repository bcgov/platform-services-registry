import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import { getCommentCountOp } from './_operations/count';

const pathParamsSchema = z.object({
  licencePlate: z.string(),
});

const queryParamsSchema = z.object({
  requestId: z.string().optional(),
});

export const GET = createApiHandler({
  roles: ['admin', 'private-admin'],
  permissions: [PermissionsEnum.ViewAllPrivateProductComments],
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
