import { z } from 'zod';
// import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, NotFoundResponse } from '@/core/responses';
import { readMonthlyCosts } from '@/services/backend/private-cloud/costs';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  'year-month': z.string(),
});

export const GET = createApiHandler({
  // roles: [GlobalRole.User],
  // permissions: [],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams }) => {
  const { licencePlate, 'year-month': yearMonth } = pathParams;

  const monthlyCosts = await readMonthlyCosts(licencePlate, yearMonth);
  if (!monthlyCosts) {
    return NotFoundResponse('Monthly costs not found');
  }

  return OkResponse(monthlyCosts);
});
