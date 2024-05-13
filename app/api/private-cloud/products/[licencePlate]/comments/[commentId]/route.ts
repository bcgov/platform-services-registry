import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import { deleteOp } from '../_operations/delete';
import { readOp } from '../_operations/read';
import { updateOp } from '../_operations/update';

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
})(async ({ pathParams }) => {
  const { licencePlate, commentId } = pathParams;
  const comment = await readOp(licencePlate, commentId);
  if (!comment) {
    return NotFoundResponse('Comment not found');
  }
  return OkResponse(comment);
});

const updateCommentBodySchema = z.object({
  text: z.string().min(1, 'The comment text must not be empty'),
});

export const PUT = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.EditAllPrivateProductComments],
  validations: {
    pathParams: licencePlateSchema,
    body: updateCommentBodySchema,
  },
})(async ({ pathParams, body }) => {
  const { commentId } = pathParams;
  const updatedComment = await updateOp(commentId, body.text);
  if (!updatedComment) {
    return NotFoundResponse('Comment not found or update failed');
  }

  return OkResponse(updatedComment);
});

export const DELETE = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.DeleteAllPrivateProductComments],
  validations: {
    pathParams: licencePlateSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate, commentId } = pathParams;
  const result = await deleteOp(licencePlate, commentId);
  if (!result) {
    return NotFoundResponse('Comment not found or deletion failed');
  }

  return OkResponse({ success: true });
});
