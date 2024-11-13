import { Quota, Cluster, QuotaUpgradeResourceDetail, ResourceType } from '@prisma/client';
import _each from 'lodash-es/each';
import { resourceOptions } from '@/../app/constants';
import { getResourceDetails } from '@/services/k8s';
import { iterateObject } from '@/utils/collection';

export interface Quotas {
  testQuota: Quota;
  toolsQuota: Quota;
  developmentQuota: Quota;
  productionQuota: Quota;
}

function checkAutoApprovalEligibility({ allocation, deployment, resourceType }: QuotaUpgradeResourceDetail): boolean {
  console.log('allocation', allocation);
  console.log('deployment', deployment);
  console.log('resourceType', resourceType);

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

function extractQuotas(quotas: Quotas) {
  const { testQuota, toolsQuota, developmentQuota, productionQuota } = quotas;
  return { testQuota, toolsQuota, developmentQuota, productionQuota };
}

export async function getQuotaChangeStatus({
  licencePlate,
  cluster,
  currentQuota,
  requestedQuota,
}: {
  licencePlate: string;
  cluster: Cluster;
  currentQuota: Quotas;
  requestedQuota: Quotas;
}) {
  const _currentQuota = extractQuotas(currentQuota);
  const _requestedQuota = extractQuotas(requestedQuota);

  let hasChange = false;
  let hasIncrease = false;
  let hasSignificantIncrease = false;

  const resourcesToCheck: {
    envQuota: keyof Quotas;
    resourceName: keyof Quota;
  }[] = [];

  iterateObject(_currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    iterateObject(quota, (currentResource: string, resourceName: keyof Quota) => {
      const requestedResource = _requestedQuota[envQuota][resourceName];
      const resourceOrder = resourceOptions[resourceName];

      const currentIndex = resourceOrder.findIndex((res) => res.value === currentResource);
      const requestedIndex = resourceOrder.findIndex((res) => res.value === requestedResource);
      const diff = requestedIndex - currentIndex;

      if (!hasChange) hasChange = diff !== 0;
      if (diff > 0) {
        hasIncrease = true;
        hasSignificantIncrease = diff > 1;
        if (hasSignificantIncrease) {
          return false;
        }

        resourcesToCheck.push({
          envQuota,
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
      resourcesToCheck.map(async ({ envQuota, resourceName }) =>
        getResourceDetails({ licencePlate, cluster, envQuota, resourceName, currentQuota }),
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
