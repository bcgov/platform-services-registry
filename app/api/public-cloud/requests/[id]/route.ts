import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPublicCloudRequest } from '@/queries/public-cloud-requests';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { id } = pathParams;

  const request = await getPublicCloudRequest(session, id);

  if (!request?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(request);
});
