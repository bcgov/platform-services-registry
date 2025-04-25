import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getAdminMonthlyCosts } from '@/services/db/private-cloud-costs';

const pathParamSchema = z.object({
  'year-month': z.string(),
});

export const GET = createApiHandler({
  //   roles: [GlobalRole.Admin],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams }) => {
  const { 'year-month': yearMonth } = pathParams;
  const [year, month] = yearMonth.split('-').map(Number);
  const monthlyCosts = await getAdminMonthlyCosts(year, month);
  return OkResponse(monthlyCosts);
});
