import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { createOp } from './_operations/create';
import listOp from './_operations/list';
import { z } from 'zod';
import { PermissionsEnum } from '@/types/permissions';
import { UnauthorizedResponse, CreatedResponse } from '@/core/responses';

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

export async function GET() {
  const data = await listOp();
  return NextResponse.json(data);
}
