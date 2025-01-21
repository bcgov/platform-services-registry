import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { userUpdateBodySchema } from '@/validation-schemas';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema, deletePathParamSchema } from './schema';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewTasks],
  validations: { pathParams: pathParamSchema },
});

export const PUT = createApiHandler({
  permissions: [GlobalPermissions.EditUsers],
  validations: { pathParams: putPathParamSchema, body: userUpdateBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});

export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.user.get({ where: { id } }, session);

  return OkResponse(request);
});
