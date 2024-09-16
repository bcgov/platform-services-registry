import { Quota } from '@prisma/client';
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

const areQuotasEqual = (currentQuota: Quota, requestedQuota: Quota): boolean => {
  return (
    currentQuota.cpu === requestedQuota.cpu &&
    currentQuota.memory === requestedQuota.memory &&
    currentQuota.storage === requestedQuota.storage
  );
};

// check if request contains quota change
export const isNoQuotaChanged = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  const quotaKeys: (keyof Quotas)[] = ['productionQuota', 'testQuota', 'developmentQuota', 'toolsQuota'];
  return quotaKeys.every((key) => areQuotasEqual(currentQuota[key], requestedQuota[key]));
};

export const isResourseUpgrade = (requestedQuota: string, currentQuota: string): boolean => {
  return extractNumbers(requestedQuota)[0] > extractNumbers(currentQuota)[0];
};

const isAnyResouseUpgrade = (requestedQuota: Quota, currentQuota: Quota): boolean => {
  return (
    isResourseUpgrade(requestedQuota.cpu, currentQuota.cpu) ||
    isResourseUpgrade(requestedQuota.memory, currentQuota.memory) ||
    isResourseUpgrade(requestedQuota.storage, currentQuota.storage)
  );
};

// if quota was changed check if it was undngrade quota request
export const isQuotaUpgrade = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  const quotaKeys: (keyof Quotas)[] = ['productionQuota', 'developmentQuota', 'testQuota', 'toolsQuota'];
  return quotaKeys.some((key) => isAnyResouseUpgrade(currentQuota[key], requestedQuota[key]));
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
  const projectIndex = keys.indexOf(projectQuota);
  const requestIndex = keys.indexOf(requestQuota);

  // Check if the requestQuota is exactly the next tier (i.e., requestIndex = projectIndex + 1)
  return requestIndex === projectIndex + 1;
};

// if quota was changed and it wasn't downgrade quota request, check if it is next tier upgrade

const checkIfQuotasNextTierUpgrade = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  const quotaTypes = Object.keys(currentQuota.productionQuota) as (keyof Quota)[];
  const namespaces = Object.keys(currentQuota) as (keyof Quotas)[];

  return namespaces.every((namespace) =>
    quotaTypes.every((resource) =>
      isQuotaUpgradeNextTier(
        currentQuota[namespace][resource],
        requestedQuota[namespace][resource],
        getLookupResource(resource),
      ),
    ),
  );
};

export const checkBasicsIfAutoApproval = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  return (
    isNoQuotaChanged(currentQuota, requestedQuota) ||
    !isQuotaUpgrade(currentQuota, requestedQuota) ||
    checkIfQuotasNextTierUpgrade(currentQuota, requestedQuota)
  );
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

const checkIfResourceUtilized = async (requestedQuota: Quotas, licencePlate: string, cluster: string) => {
  const quotaTypes = ['cpu', 'memory'] as const;
  const namespaces = ['dev', 'test', 'prod', 'tools'] as const;
  let ifAutoApproval = false;

  // Iterate over namespaces and quota types to check if resource is utilized
  for (const namespace of namespaces) {
    for (const resource of quotaTypes) {
      ifAutoApproval = await checkUtilization(requestedQuota, licencePlate, cluster, namespace, resource);
    }
  }
  return ifAutoApproval;
};

export const checkIfAutoApprovalBasicsAndUsage = (
  currentQuota: Quotas,
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: string,
) => {
  if (checkBasicsIfAutoApproval(currentQuota, requestedQuota)) {
    return true;
  }
  return checkIfResourceUtilized(requestedQuota, licencePlate, cluster);
};
