import { Cluster } from '@prisma/client';
import { z, string } from 'zod';
import { IS_PROD, IS_TEST } from '@/config';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getPodMetrics } from '@/services/k8s';
import { getPathParamSchema } from '../schema';

const queryParamSchema = z.object({
  environment: string(),
  cluster: z.nativeEnum(Cluster),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema, pathParams: getPathParamSchema },
});

export const GET = apiHandler(async ({ queryParams, pathParams, session }) => {
  const { environment } = queryParams;
  let { cluster } = queryParams;
  let { licencePlate } = pathParams;
  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  if (!(IS_PROD || IS_TEST)) {
    licencePlate = 'f6ee34';
    cluster = 'KLAB';
  }

  const metrics = await getPodMetrics(licencePlate, environment, cluster);
  return OkResponse(metrics);
});
