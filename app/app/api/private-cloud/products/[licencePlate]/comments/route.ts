import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CreatedResponse, OkResponse, BadRequestResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import { createOp } from './_operations/create';
import { listOp } from './_operations/list';

const createCommentBodySchema = z
  .object({
    text: z.string().min(1, 'The comment text must not be empty'),
    projectId: z.string().optional(),
    requestId: z.string().optional(),
  })
  .refine((data) => data.projectId || data.requestId, {
    message: 'Either projectId or requestId must be provided',
    path: ['projectId', 'requestId'],
  });

export const POST = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [PermissionsEnum.CreatePrivateProductComments],
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
  permissions: [PermissionsEnum.ViewAllPrivateProductComments],
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
