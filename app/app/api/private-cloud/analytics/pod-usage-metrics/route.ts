import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import getPodMetrics from '@/helpers/pod-usage-metrics';

const queryParamSchema = z.object({
  licencePlate: z.string(),
  namespacePostfix: z.string(),
  cluster: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams }) => {
  const { licencePlate, namespacePostfix, cluster } = queryParams;
  const users = await getPodMetrics(licencePlate, namespacePostfix, cluster);
  return OkResponse(users);
});
