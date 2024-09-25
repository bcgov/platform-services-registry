import { Cluster } from '@prisma/client';
import { z, string } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import getPodMetrics from '@/services/openshift-kubernetis-metrics/usage-metrics';
import { getPathParamSchema } from '../schema';

const clusterEnum = z.nativeEnum(Cluster);

const queryParamSchema = z.object({
  environment: string(),
  cluster: clusterEnum,
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema, pathParams: getPathParamSchema },
});

export const GET = apiHandler(async ({ queryParams, pathParams, session }) => {
  const { environment, cluster } = queryParams;
  const { licencePlate } = pathParams;
  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }
  const users = await getPodMetrics(licencePlate, environment, cluster);
  return OkResponse(users);
});
