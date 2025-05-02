import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getYearlyCosts } from '@/services/db/private-cloud-costs';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  year: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, year } = pathParams;
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

  const result = await getYearlyCosts(licencePlate, year);
  return OkResponse(result);
});
