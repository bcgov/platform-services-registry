import { Quota, Cluster } from '@prisma/client';
import _each from 'lodash-es/each';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { getTotalMetrics } from '@/helpers/resource-metrics';
import { getPodMetrics } from '@/services/k8s/usage-metrics';
import { iterateObject, asyncEvery } from '@/utils/collection';
import { extractNumbers } from '@/utils/string';

const envQuotaToEnv = {
  developmentQuota: 'dev',
  testQuota: 'test',
  productionQuota: 'prod',
  toolsQuota: 'tools',
};

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

export async function checkAutoApprovalEligibility({
  licencePlate,
  cluster,
  envQuota,
  resourceName,
  currentQuota,
}: {
  licencePlate: string;
  cluster: Cluster;
  envQuota: keyof Quotas;
  resourceName: keyof Quota;
  currentQuota: Quotas;
}) {
  // Since storage usage data is unavailable, an admin review is always necessary.
  if (resourceName === 'storage') return false;

  const podMetricsData = await getPodMetrics(licencePlate, envQuotaToEnv[envQuota], cluster);
  if (podMetricsData.length === 0) return false;

  const { totalRequest, totalUsage } = getTotalMetrics(podMetricsData, resourceName);
  const mesUnitsCoeff = resourceName === 'cpu' ? 1000 : 1024 * 1024;
  const resourceValues = extractNumbers(currentQuota[envQuota][resourceName]);
  const limitValue = resourceValues[1] * mesUnitsCoeff;

  // Check the current usage
  if (totalUsage / limitValue <= 0.85) {
    return false;
  }

  // Check the utilization rate
  if (totalUsage / totalRequest < 0.35) {
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
    };
  }

  if (hasIncrease) {
    return {
      hasChange: true,
      hasIncrease: true,
      hasSignificantIncrease: false,
      resourceCheckRequired: true,
      isEligibleForAutoApproval: await asyncEvery(resourcesToCheck, async ({ envQuota, resourceName }) => {
        return checkAutoApprovalEligibility({ licencePlate, cluster, envQuota, resourceName, currentQuota });
      }),
    };
  }

  return {
    hasChange,
    hasIncrease: false,
    hasSignificantIncrease: false,
    isEligibleForAutoApproval: true,
    resourceCheckRequired: false,
  };
}
