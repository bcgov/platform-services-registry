import {
  Cluster,
  QuotaUpgradeResourceDetail,
  ResourceType,
  ResourceRequestsEnv,
  ResourceRequests,
} from '@/prisma/client';
import { getResourceDetails } from '@/services/k8s/metrics';
import { iterateObject } from '@/utils/js';

const allowedAutoApprovalPercentage = 50;

const allowedMinResource = {
  cpu: 1,
  memory: 2,
  storage: 32,
};

function checkAutoApprovalEligibility({ allocation, deployment, resourceType }: QuotaUpgradeResourceDetail): boolean {
  if (deployment.usage === -1) return false;

  // Calculate usage-to-limit and utilization ratios
  const usageRatio = deployment.usage / allocation.request;
  if (resourceType === ResourceType.storage) {
    // Approve if storage usage exceeds 80% of limit
    return usageRatio > 0.8;
  }
  const utilizationRate = deployment.usage / allocation.request;
  // Approve CPU/Memory if utilization is at least 35%
  return utilizationRate >= 0.35;
}

function extractResourceRequests(resourceRequests: ResourceRequestsEnv) {
  const { development, test, production, tools } = resourceRequests;
  return { development, test, production, tools };
}

export async function getQuotaChangeStatus({
  licencePlate,
  cluster,
  currentResourceRequests,
  requestedResourceRequests,
}: {
  licencePlate: string;
  cluster: Cluster;
  currentResourceRequests: ResourceRequestsEnv;
  requestedResourceRequests: ResourceRequestsEnv;
}) {
  const _currentResourceRequests = extractResourceRequests(currentResourceRequests);
  const _requestedResourceRequests = extractResourceRequests(requestedResourceRequests);

  let hasChange = false;
  let hasIncrease = false;
  let hasSignificantIncrease = false;
  const metricResourceTypes = [ResourceType.cpu, ResourceType.memory, ResourceType.storage] as const;

  type MetricResourceType = (typeof metricResourceTypes)[number];

  const resourcesToCheck: {
    env: keyof ResourceRequestsEnv;
    resourceName: MetricResourceType;
  }[] = [];

  iterateObject(_currentResourceRequests, (resourceRequests: ResourceRequests, env: keyof ResourceRequestsEnv) => {
    for (const resourceName of metricResourceTypes) {
      const currentValue = resourceRequests[resourceName];
      const requestedValue = _requestedResourceRequests[env][resourceName];

      const diffValue = requestedValue - currentValue;
      const diffPerc = currentValue === 0 ? Infinity : (diffValue / currentValue) * 100;
      const allowedMin = allowedMinResource[resourceName];

      if (diffValue !== 0) {
        hasChange = true;
      }

      if (diffValue > 0) {
        hasIncrease = true;
        hasSignificantIncrease = requestedValue > allowedMin && diffPerc > allowedAutoApprovalPercentage;
        if (hasSignificantIncrease) {
          return false;
        }

        resourcesToCheck.push({
          env,
          resourceName,
        });
      }
    }
    const currentGpu = resourceRequests.gpu ?? 0;
    const requestedGpu = _requestedResourceRequests[env].gpu ?? 0;
    const gpuDiff = requestedGpu - currentGpu;

    if (gpuDiff !== 0) {
      hasChange = true;
    }

    if (gpuDiff > 0) {
      hasIncrease = true;
      hasSignificantIncrease = true;
      return false;
    }
  });

  if (hasSignificantIncrease) {
    return {
      hasChange: true,
      hasIncrease: true,
      hasSignificantIncrease: true,
      isEligibleForAutoApproval: false,
      resourceCheckRequired: false,
      resourceDetailList: [],
    };
  }

  if (hasIncrease) {
    const resourceDetailList = await Promise.all(
      resourcesToCheck.map(async ({ env, resourceName }) =>
        getResourceDetails({ licencePlate, cluster, env, resourceName, currentResourceRequests }),
      ),
    );

    return {
      hasChange: true,
      hasIncrease: true,
      hasSignificantIncrease: false,
      resourceCheckRequired: true,
      isEligibleForAutoApproval: resourceDetailList.every(checkAutoApprovalEligibility),
      resourceDetailList,
    };
  }

  return {
    hasChange,
    hasIncrease: false,
    hasSignificantIncrease: false,
    isEligibleForAutoApproval: true,
    resourceCheckRequired: false,
    resourceDetailList: [],
  };
}
