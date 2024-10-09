import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { publicCloudRequestModel } from '@/services/db';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const { data: request } = await publicCloudRequestModel.get({ where: { id } }, session);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});
