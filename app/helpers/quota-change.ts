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
  currentResourceRequests?: ResourceRequestsEnv,
): ResourceRequestsEnv {
  const gpuEnabled = cluster === Cluster.EMERALD || cluster === Cluster.KLAB2;

  return Object.fromEntries(
    Object.entries(resourceRequests).map(([namespace, requests]) => {
      const key = namespace as keyof ResourceRequestsEnv;

      return [
        namespace,
        {
          ...requests,
          gpu: !gpuEnabled ? 0 : canManageGpu ? requests.gpu ?? 0 : currentResourceRequests?.[key]?.gpu ?? 0,
        },
      ];
    }),
  ) as ResourceRequestsEnv;
}
