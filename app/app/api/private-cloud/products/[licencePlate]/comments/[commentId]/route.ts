import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { deleteOp } from '../_operations/delete';
import { readOp } from '../_operations/read';
import { updateOp } from '../_operations/update';

const licencePlateSchema = z.object({
  licencePlate: z.string(),
  commentId: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [GlobalPermissions.ViewAllPrivateProductComments],
  validations: {
    pathParams: licencePlateSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate, commentId } = pathParams;
  const comment = await readOp(commentId);
  if (!comment) {
    return NotFoundResponse('Comment not found');
  }
  return OkResponse(comment);
});

const updateCommentBodySchema = z.object({
  text: z.string().min(1, 'The comment text must not be empty'),
});

export const PUT = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [GlobalPermissions.EditAllPrivateProductComments],
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
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  permissions: [GlobalPermissions.DeleteAllPrivateProductComments],
  validations: {
    pathParams: licencePlateSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate, commentId } = pathParams;
  const result = await deleteOp(commentId);
  if (!result) {
    return NotFoundResponse('Comment not found or deletion failed');
  }

  return OkResponse({ success: true });
});
