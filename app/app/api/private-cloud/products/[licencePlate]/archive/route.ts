import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { commentSchema } from '@/validation-schemas/shared';
import deleteOp from '../../_operations/delete';
import { deletePathParamSchema } from '../schema';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: deletePathParamSchema,
    body: z.object({
      requestComment: commentSchema,
    }),
  },
})(async ({ pathParams, body, session }) => {
  const { requestComment } = body;
  const response = await deleteOp({ session, requestComment, pathParams });
  return response;
});
