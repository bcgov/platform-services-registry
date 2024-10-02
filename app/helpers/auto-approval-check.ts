import { Quota, Cluster, Env, QuotaUpgradeResourceDetail } from '@prisma/client';
import _each from 'lodash-es/each';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { getTotalMetrics, memoryUnitMultipliers, cpuCoreToMillicoreMultiplier } from '@/helpers/resource-metrics';
import { getPodMetrics } from '@/services/k8s/usage-metrics';
import { iterateObject, asyncEvery } from '@/utils/collection';
import { extractNumbers } from '@/utils/string';

const envQuotaToEnv = {
  developmentQuota: Env.dev,
  testQuota: Env.test,
  productionQuota: Env.prod,
  toolsQuota: Env.tools,
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

export async function checkAutoApprovalEligibility({ allocation, deployment }: QuotaUpgradeResourceDetail) {
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

export async function getResourceDetails({
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
  const env = envQuotaToEnv[envQuota];
  const result: QuotaUpgradeResourceDetail = {
    env,
    allocation: {
      request: -1,
      limit: -1,
    },
    deployment: {
      request: -1,
      limit: -1,
      usage: -1,
    },
  };

  // Since storage usage data is unavailable, an admin review is always necessary.
  if (resourceName === 'storage') return result;

  const podMetricsData = await getPodMetrics(licencePlate, env, cluster);
  if (podMetricsData.length === 0) return result;

  const { totalRequest, totalLimit, totalUsage } = getTotalMetrics(podMetricsData, resourceName);
  result.deployment.request = totalRequest;
  result.deployment.limit = totalLimit;
  result.deployment.usage = totalUsage;

  const unitMultiplier = resourceName === 'cpu' ? cpuCoreToMillicoreMultiplier : memoryUnitMultipliers.Gi;
  const resourceValues = extractNumbers(currentQuota[envQuota][resourceName]);
  const deploymentRequest = resourceValues[0] * unitMultiplier;
  const deploymentLimit = resourceValues[1] * unitMultiplier;

  result.allocation.request = deploymentRequest;
  result.allocation.limit = deploymentLimit;

  return result;
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
