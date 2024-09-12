import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import getPodMetrics from '@/services/openshift-kubernetis-metrics/pod-usage-metrics';

const queryParamSchema = z.object({
  licencePlate: z.string(),
  environment: z.string(),
  cluster: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams, session }) => {
  const { licencePlate, environment, cluster } = queryParams;
  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }
  const users = await getPodMetrics(licencePlate, environment, cluster);
  return OkResponse(users);
});
