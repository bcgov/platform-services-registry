import {
  Cluster,
  QuotaUpgradeResourceDetail,
  ResourceType,
  ResourceRequestsEnv,
  ResourceRequests,
} from '@prisma/client';
import _each from 'lodash-es/each';
import { getResourceDetails } from '@/services/k8s';
import { iterateObject } from '@/utils/collection';

function checkAutoApprovalEligibility({ allocation, deployment, resourceType }: QuotaUpgradeResourceDetail): boolean {
  if (deployment.usage === -1) return false;

  // Calculate usage-to-limit and utilization ratios
  const usageRatio = deployment.usage / allocation.limit;
  if (resourceType === ResourceType.storage) {
    // Approve if storage usage exceeds 80% of limit
    return usageRatio > 0.8;
  }
  const utilizationRate = deployment.usage / deployment.request;
  // Approve CPU/Memory if usage exceeds 85% of limit and utilization is at least 35%
  return usageRatio > 0.85 && utilizationRate >= 0.35;
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

  const resourcesToCheck: {
    env: keyof ResourceRequestsEnv;
    resourceName: keyof ResourceRequests;
  }[] = [];

  iterateObject(_currentResourceRequests, (resourceRequests: ResourceRequests, env: keyof ResourceRequestsEnv) => {
    iterateObject(resourceRequests, (currentValue: number, resourceName: keyof ResourceRequests) => {
      const requestedValue = _requestedResourceRequests[env][resourceName];

      const diffValue = requestedValue - currentValue;
      const diffPerc = (diffValue / currentValue) * 100;

      if (!hasChange) hasChange = diffValue !== 0;
      if (diffValue > 0) {
        hasIncrease = true;
        hasSignificantIncrease = diffPerc > 100;
        if (hasSignificantIncrease) {
          return false;
        }

        resourcesToCheck.push({
          env,
          resourceName,
        });
      }
    });

    if (hasSignificantIncrease) {
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
