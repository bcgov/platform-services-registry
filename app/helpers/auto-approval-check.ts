import { Quota } from '@prisma/client';
import _some from 'lodash-es/some';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { ResourceType, totalMetrics } from '@/services/openshift-kubernetis-metrics/helpers';
import getPodMetrics from '@/services/openshift-kubernetis-metrics/pod-usage-metrics';
import { extractNumbers } from '@/utils/string';
interface Quotas {
  testQuota: Quota;
  toolsQuota: Quota;
  developmentQuota: Quota;
  productionQuota: Quota;
}

// check if request contains quota change
export const isNoQuotaChanged = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  // @ts-ignore
  return _some(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    return _some(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      return extractNumbers(requestedVal)[0] === extractNumbers(currentVal)[0];
    });
  });
};

// if quota was changed check if it was undngrade quota request
export const isQuotaUpgrade = (currentQuota: Quotas, requestedQuota: Quotas) => {
  // @ts-ignore
  const isIncreased = _some(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    return _some(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      return extractNumbers(requestedVal)[0] > extractNumbers(currentVal)[0];
    });
  });
  return isIncreased;
};

const getLookupResource = (resource: string) => {
  switch (resource) {
    case 'cpu':
      return defaultCpuOptionsLookup;
    case 'memory':
      return defaultMemoryOptionsLookup;
    case 'storage':
      return defaultStorageOptionsLookup;
    default:
      throw new Error(`Unknown resource type: ${resource}`);
  }
};

const isQuotaUpgradeNextTier = (
  projectQuota: string,
  requestQuota: string,
  lookupTable: { [key: string]: string },
): boolean => {
  const keys = Object.keys(lookupTable);
  return _some(keys, (key, index) => key === projectQuota && keys[index + 1] === requestQuota);
};

// if quota was changed and it wasn't downgrade quota request, check if it is next tier upgrade

const checkIfQuotasNextTierUpgrade = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  // @ts-ignore
  return _some(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    return _some(quota, (resource: string, resourceName: keyof Quota) => {
      const lookupTable = getLookupResource(resourceName);
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      return isQuotaUpgradeNextTier(currentVal, requestedVal, lookupTable);
    });
  });
};

export const checkBasicsIfAutoApproval = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  return isNoQuotaChanged(currentQuota, requestedQuota) || !isQuotaUpgrade(currentQuota, requestedQuota);
};

// Helper function to check resource utilization
const checkUtilization = async (
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: string,
  namespace: string,
  resource: ResourceType,
) => {
  const podMetricsData = await getPodMetrics(licencePlate, namespace, cluster);
  if (!podMetricsData) return false;

  const { totalUsage, totalLimit } = totalMetrics(podMetricsData, resource);

  // Check quota utilization
  if (totalLimit && totalUsage) {
    const utilizationPercentage = (totalLimit / totalUsage) * 100;
    if (utilizationPercentage < 86) {
      return true; // Auto-approval due to utilization percentage
    }

    // Check quota usage
    const requestedUsage = extractNumbers(requestedQuota.developmentQuota.cpu)[0];
    const requestedUtilizationRate = (requestedUsage / totalUsage) * 100;
    if (requestedUtilizationRate > 34) {
      return true;
    }
  }

  return false;
};

const checkIfResourceUtilized = async (
  currentQuota: Quotas,
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: string,
) => {
  if (!checkIfQuotasNextTierUpgrade(currentQuota, requestedQuota)) {
    return false;
  }
  let ifAutoApproval = false;
  const quotaTypes = ['cpu', 'memory'] as const;
  const namespaces = ['dev', 'test', 'prod', 'tools'] as const;

  // Iterate over namespaces and quota types to check if resource is utilized
  for (const namespace of namespaces) {
    for (const resource of quotaTypes) {
      ifAutoApproval = await checkUtilization(requestedQuota, licencePlate, cluster, namespace, resource);
    }
  }
  return ifAutoApproval;
};

export const checkIfAutoApproval = (
  currentQuota: Quotas,
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: string,
) => {
  if (checkBasicsIfAutoApproval(currentQuota, requestedQuota)) {
    return true;
  }
  return checkIfResourceUtilized(currentQuota, requestedQuota, licencePlate, cluster);
};
