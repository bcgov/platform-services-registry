import createApiHandler from '@/core/api-handler';
import { createOp } from './_operations/create';
import { listOp } from './_operations/list';
import { z } from 'zod';
import { PermissionsEnum } from '@/types/permissions';
import { CreatedResponse, OkResponse } from '@/core/responses';

const CreateCommentBodySchema = z.object({
  text: z.string().min(1, 'The comment text must not be empty'),
  projectId: z.string(),
});

export const POST = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.CreatePrivateProductComments],
  validations: {
    body: CreateCommentBodySchema,
  },
})(async ({ session, body }) => {
  const userId = session!.userId!;

  const comment = await createOp(body.text, body.projectId, userId);
  return CreatedResponse(comment);
});

const PathParamsSchema = z.object({
  licencePlate: z.string(),
});

export const GET = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ViewAllPrivateProductComments],
  validations: {
    pathParams: PathParamsSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate } = pathParams;

  const comments = await listOp(licencePlate);
  return OkResponse(comments);
});
