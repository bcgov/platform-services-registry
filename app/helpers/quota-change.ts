import { namespaceKeys, resourceKeys } from '@/constants/private-cloud';
import { Cluster, ResourceRequestsEnv } from '@/prisma/client';
import { extractNumbers } from '@/utils/js';

export const isResourseDowngrade = (req: string, prod: string) => {
  return extractNumbers(req)[0] < extractNumbers(prod)[0];
};

type GpuPermissionSession = {
  isAdmin?: boolean;
  permissions?: {
    reviewAllPrivateCloudRequests?: boolean;
  };
};

export const canManageGpuQuota = (session?: GpuPermissionSession | null) =>
  !!session?.isAdmin || !!session?.permissions?.reviewAllPrivateCloudRequests;

export const isQuotaUpgrade = (oldval: ResourceRequestsEnv, newval: ResourceRequestsEnv) =>
  namespaceKeys.some((namespace) =>
    resourceKeys.some((resource) => (oldval[namespace][resource] ?? 0) < (newval[namespace][resource] ?? 0)),
  );

export function sanitizeGpuResourceRequests(
  resourceRequests: ResourceRequestsEnv,
  cluster: Cluster,
  canManageGpu: boolean,
): ResourceRequestsEnv {
  const gpuEnabled = canManageGpu && (cluster === Cluster.EMERALD || cluster === Cluster.KLAB2);

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
