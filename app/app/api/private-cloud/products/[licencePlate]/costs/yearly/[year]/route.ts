import { z } from 'zod';
// import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { readYearlyCosts } from '@/services/backend/private-cloud/costs';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  year: z.string(),
});

export const GET = createApiHandler({
  // roles: [GlobalRole.User],
  // permissions: [],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate, year } = pathParams;

  const yearlyCosts = await readYearlyCosts(licencePlate, year);
  if (!yearlyCosts) {
    return NotFoundResponse('Yearly costs not found');
  }

  return OkResponse(yearlyCosts);
});
