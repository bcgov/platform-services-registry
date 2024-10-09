import { Cluster } from '@prisma/client';
import { z, string } from 'zod';
import { IS_PROD, IS_TEST } from '@/config';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { privateCloudProductModel } from '@/services/db';
import { getPodMetrics } from '@/services/k8s';
import { getPathParamSchema } from '../schema';

const queryParamSchema = z.object({
  environment: string(),
  cluster: z.nativeEnum(Cluster),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema, pathParams: getPathParamSchema },
});

export const GET = apiHandler(async ({ queryParams, pathParams, session }) => {
  const { environment } = queryParams;
  let { cluster } = queryParams;
  let { licencePlate } = pathParams;
  const { data: product } = await privateCloudProductModel.get({ where: { licencePlate } }, session);

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
