import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { createOp } from './_operations/create';
import { listOp } from './_operations/list';
import { z } from 'zod';
import { PermissionsEnum } from '@/types/permissions';
import { UnauthorizedResponse, CreatedResponse, BadRequestResponse, OkResponse } from '@/core/responses';
import path from 'path';

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
  if (!session) {
    return UnauthorizedResponse('Session not found');
  }

  const userId = session!.userId!;

  const comment = await createOp({ text: body.text, projectId: body.projectId, userId });
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
})(async ({ session, pathParams }) => {
  if (!session) {
    return UnauthorizedResponse('Session not found');
  }

  const { licencePlate } = pathParams;

  if (!licencePlate) {
    return BadRequestResponse('License plate is required');
  }

  const comments = await listOp(licencePlate);
  return OkResponse(comments);
});
