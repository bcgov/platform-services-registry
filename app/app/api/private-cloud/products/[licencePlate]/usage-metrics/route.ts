import { z } from 'zod';
import { environmentLongNames, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { Cluster, ResourceRequestsEnv } from '@/prisma/client';
import { models } from '@/services/db';
import { getUsageMetrics } from '@/services/k8s/metrics';
import { getPathParamSchema } from '../schema';

const queryParamSchema = z.object({
  environment: z.enum(['dev', 'test', 'prod', 'tools']),
  cluster: z.nativeEnum(Cluster),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema, pathParams: getPathParamSchema },
});

export const GET = apiHandler(async ({ queryParams, pathParams, session }) => {
  const { environment } = queryParams;
  const { cluster } = queryParams;
  const { licencePlate } = pathParams;
  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const metrics = await getUsageMetrics(
    licencePlate,
    environmentLongNames[environment] as keyof ResourceRequestsEnv,
    cluster,
  );
  return OkResponse(metrics);
});
