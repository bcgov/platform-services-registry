import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { Cluster } from '@/prisma/client';
import { queryCapacity, queryAllocatable, queryCpuRequests, queryCpuUsage } from '@/services/k8s/metrics/core';

const queryParamSchema = z.object({
  cluster: z.nativeEnum(Cluster),
});

export const GET = createApiHandler({
  roles: [GlobalRole.Admin],
  useServiceAccount: true,
  validations: { queryParams: queryParamSchema },
})(async ({ queryParams }) => {
  const { cluster } = queryParams;

  // See https://docs.redhat.com/en/documentation/openshift_container_platform/4.19/html/nodes/nodes-dashboard-using
  const [capacityRes, allocatableRes, requestsRes, usageRes] = await Promise.all([
    queryCapacity(cluster),
    queryAllocatable(cluster),
    queryCpuRequests(cluster),
    queryCpuUsage(cluster),
  ]);

  const capacity = Number(capacityRes[0]?.value[1] || 0);
  const allocatable = Number(allocatableRes[0]?.value[1] || 0);
  const requests = Number(requestsRes[0]?.value[1] || 0);
  const usage = Number(usageRes[0]?.value[1] || 0);

  // | Term            | Meaning                                                            |
  // | --------------- | ------------------------------------------------------------------ |
  // | **Capacity**    | The full amount of a resource on the node (e.g., total CPU/memory) |
  // | **Allocatable** | The portion of that resource Kubernetes allows for pod scheduling  |
  // | **Requests**    | The amount of resource that pods ask for                           |
  // | **Usage**       | The actual usage by running containers                             |
  return OkResponse({
    capacity,
    allocatable,
    requests,
    usage,
    requestUtilization: (requests / allocatable) * 100,
    usageEfficiency: (usage / requests) * 100,
  });
});
