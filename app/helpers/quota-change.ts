import { Cluster, ResourceRequestsEnv } from '@/prisma/client';
import { extractNumbers } from '@/utils/js';

export const isResourseDowngrade = (req: string, prod: string) => {
  return extractNumbers(req)[0] < extractNumbers(prod)[0];
};

export const isQuotaUpgrade = (oldval: ResourceRequestsEnv, newval: ResourceRequestsEnv) => {
  return (
    oldval.development.cpu < newval.development.cpu ||
    oldval.development.memory < newval.development.memory ||
    oldval.development.storage < newval.development.storage ||
    (oldval.development.gpu ?? 0) < (newval.development.gpu ?? 0) ||
    oldval.test.cpu < newval.test.cpu ||
    oldval.test.memory < newval.test.memory ||
    oldval.test.storage < newval.test.storage ||
    (oldval.test.gpu ?? 0) < (newval.test.gpu ?? 0) ||
    oldval.production.cpu < newval.production.cpu ||
    oldval.production.memory < newval.production.memory ||
    oldval.production.storage < newval.production.storage ||
    (oldval.production.gpu ?? 0) < (newval.production.gpu ?? 0) ||
    oldval.tools.cpu < newval.tools.cpu ||
    oldval.tools.memory < newval.tools.memory ||
    oldval.tools.storage < newval.tools.storage ||
    (oldval.tools.gpu ?? 0) < (newval.tools.gpu ?? 0)
  );
};

export function sanitizeGpuResourceRequests(
  resourceRequests: ResourceRequestsEnv,
  cluster: Cluster,
  isAdmin: boolean,
): ResourceRequestsEnv {
  const gpuEnabled = isAdmin && (cluster === Cluster.EMERALD || cluster === Cluster.KLAB2);

  return Object.fromEntries(
    Object.entries(resourceRequests).map(([namespace, requests]) => [
      namespace,
      {
        ...requests,
        gpu: gpuEnabled ? requests.gpu ?? 0 : 0,
      },
    ]),
  ) as ResourceRequestsEnv;
}
