import { z } from 'zod';
// import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getMonthlyCosts } from '@/services/db/private-cloud-costs';

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
  const [year, month] = yearMonth.split('-').map(Number);
  const monthlyCosts = await getMonthlyCosts(licencePlate, year, month);
  return OkResponse(monthlyCosts);
});
