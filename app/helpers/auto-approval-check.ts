import { Quota, Cluster, QuotaUpgradeResourceDetail } from '@prisma/client';
import _each from 'lodash-es/each';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { getResourceDetails } from '@/services/k8s';
import { iterateObject } from '@/utils/collection';

export interface Quotas {
  testQuota: Quota;
  toolsQuota: Quota;
  developmentQuota: Quota;
  productionQuota: Quota;
}

const resourceOrders = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
};

function checkAutoApprovalEligibility({ allocation, deployment }: QuotaUpgradeResourceDetail) {
  if (deployment.usage === -1) return false;

  // Check the current usage
  if (deployment.usage / allocation.limit <= 0.85) {
    return false;
  }

  // Check the utilization rate
  if (deployment.usage / deployment.request < 0.35) {
    return false;
  }

  return true;
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
      const resourceOrder = resourceOrders[resourceName];

      const currentIndex = Object.keys(resourceOrder).indexOf(currentResource);
      const requestedIndex = Object.keys(resourceOrder).indexOf(requestedResource);
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
