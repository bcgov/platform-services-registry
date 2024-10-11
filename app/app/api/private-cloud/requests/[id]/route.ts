import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await models.privateCloudRequest.get({ where: { id } }, session);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});
