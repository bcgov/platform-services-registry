import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { CreatedResponse, OkResponse, BadRequestResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import { createOp } from './_operations/create';
import { listOp } from './_operations/list';

const CreateCommentBodySchema = z
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
  roles: ['user'],
  permissions: [PermissionsEnum.CreatePrivateProductComments],
  validations: {
    body: CreateCommentBodySchema,
  },
})(async ({ session, body }) => {
  const userId = session!.userId!;
  const comment = await createOp(body.text, userId, body.projectId, body.requestId);
  return CreatedResponse(comment);
});

const PathParamsSchema = z.object({
  licencePlate: z.string(),
});

const QueryParamsSchema = z.object({
  requestId: z.string().optional(),
});

export const GET = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ViewAllPrivateProductComments],
  validations: {
    pathParams: PathParamsSchema,
    queryParams: QueryParamsSchema,
  },
})(async ({ pathParams, queryParams }) => {
  const { licencePlate } = pathParams;
  const { requestId } = queryParams;

  const comments = await listOp(licencePlate, requestId);
  return OkResponse(comments);
});
