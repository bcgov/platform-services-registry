import { z } from 'zod';
// import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { getYearlyCosts } from '@/services/db/private-cloud-costs';

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
  const yearlyCosts = await getYearlyCosts(licencePlate, year);
  return OkResponse(yearlyCosts);
});
