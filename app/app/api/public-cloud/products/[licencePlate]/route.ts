import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { publicCloudEditRequestBodySchema } from '@/validation-schemas/public-cloud';
import { commentSchema } from '@/validation-schemas/shared';
import deleteOp from '../_operations/delete';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await readOp({ session, pathParams });
  return response;
});

export const PUT = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: putPathParamSchema, body: publicCloudEditRequestBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});

export const DELETE = createApiHandler({
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
