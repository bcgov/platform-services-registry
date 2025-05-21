import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CreatedResponse, OkResponse } from '@/core/responses';
import { createCommentBodySchema } from '@/validation-schemas/shared';
import { createOp } from './_operations/create';
import { listOp } from './_operations/list';

export const POST = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [GlobalPermissions.CreatePrivateProductComments],
  validations: {
    body: createCommentBodySchema,
  },
})(async ({ session, body }) => {
  const userId = session.userId as string;
  const comment = await createOp(body.text, userId, body.projectId, body.requestId);
  return CreatedResponse(comment);
});

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

  const comments = await listOp(licencePlate, requestId);
  return OkResponse(comments);
});
