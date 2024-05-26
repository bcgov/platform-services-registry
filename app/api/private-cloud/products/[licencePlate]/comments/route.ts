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
  try {
    const userId = session!.userId!;
    console.log('Received body:', body);

    const comment = await createOp(body.text, userId, body.projectId, body.requestId);
    return CreatedResponse(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return BadRequestResponse(errorMessage);
  }
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
