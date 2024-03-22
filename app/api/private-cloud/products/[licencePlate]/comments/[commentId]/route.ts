import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { z } from 'zod';
import { PermissionsEnum } from '@/types/permissions';
import { UnauthorizedResponse, OkResponse, NotFoundResponse } from '@/core/responses';
import deleteOp from '../_operations/delete';
import { readOp } from '../_operations/read';
import updateOp from '../_operations/update';

const licencePlateSchema = z.object({
  licencePlate: z.string(),
  commentId: z.string(),
});

export const GET = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ViewAllPrivateProductComments],
  validations: {
    pathParams: licencePlateSchema,
  },
})(async ({ session, pathParams }) => {
  if (!session) {
    return UnauthorizedResponse('Session not found');
  }
  const { licencePlate, commentId } = pathParams;
  const comment = await readOp(licencePlate, commentId);
  if (!comment) {
    return NotFoundResponse('Comment not found');
  }
  return OkResponse(comment);
});

export async function PUT() {
  const data = await updateOp();
  return NextResponse.json(data);
}

export async function DELETE() {
  const data = await deleteOp();
  return NextResponse.json(data);
}
