import { Cluster } from '@prisma/client';
import { z, string } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getSubnet } from '@/services/k8s';
import { getPathParamSchema } from '../schema';

const queryParamSchema = z.object({
  environment: string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema, pathParams: getPathParamSchema },
});

export const GET = apiHandler(async ({ queryParams, pathParams, session }) => {
  const { environment } = queryParams;
  const { licencePlate } = pathParams;
  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const subnetInfo = await getSubnet(licencePlate, environment, product.cluster);
  return OkResponse(subnetInfo);
});
