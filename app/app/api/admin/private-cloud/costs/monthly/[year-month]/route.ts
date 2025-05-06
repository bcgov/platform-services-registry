import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { getAdminMonthlyCosts } from '@/services/db/private-cloud-costs';
import { privateCloudBillingSearchBodySchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  'year-month': z.string(),
});

const querySchema = privateCloudBillingSearchBodySchema.pick({ page: true, pageSize: true });

export const GET = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.BillingManager, GlobalRole.Billingreader],
  validations: {
    pathParams: pathParamSchema,
    queryParams: querySchema,
  },
})(async ({ pathParams, queryParams }) => {
  const { 'year-month': yearMonth } = pathParams;
  const { page, pageSize } = queryParams;

  const [year, month] = yearMonth.split('-').map(Number);

  const result = await getAdminMonthlyCosts(year, month, page, pageSize);
  return OkResponse(result);
});
