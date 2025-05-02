import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getMonthlyCosts } from '@/services/db/private-cloud-costs';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  'year-month': z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, 'year-month': yearMonth } = pathParams;
  const { data: product } = await models.privateCloudProduct.get(
    {
      where: {
        licencePlate,
      },
    },
    session,
  );

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const [year, month] = yearMonth.split('-').map(Number);
  const result = await getMonthlyCosts(licencePlate, year, month);

  return OkResponse(result);
});
