import { Quota } from '@prisma/client';
import _each from 'lodash-es/each';
import _flatMap from 'lodash-es/flatMap';
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
export const checkIfNoQuotaChange = (currentQuota: Quotas, requestedQuota: Quotas) => {
  // @ts-ignore
  return _each(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    return _each(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      return extractNumbers(requestedVal)[0] === extractNumbers(currentVal)[0];
    });
  });
};

// if quota was changed check if it was undngrade quota request
// TODO replace isQuotaUpgrade at app/emails/_templates/private-cloud/TeamEditRequest.tsx
export const checkIfQuotaUpgrade = (currentQuota: Quotas, requestedQuota: Quotas) => {
  // @ts-ignore
  const isIncreased = _each(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    return _each(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      return extractNumbers(requestedVal)[0] > extractNumbers(currentVal)[0];
    });
  });
  return isIncreased;
};

const resourceOrders = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
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
  // namespace already use 85% of total limit(i.e: kube_pod_container_resource_limits/namespace-total-limit)(CPU or memory, or storage)
  if (totalLimit && totalUsage) {
    const utilizationPercentage = (totalLimit / totalUsage) * 100;
    if (utilizationPercentage < 86) {
      return true; // Auto-approval due to utilization percentage
    }

    // Check quota usage
    // namespace has at least 35% of CPU utilization rate(namespace:container_cpu_usage/namespace_cpu:kube_pod_container_resource_requests:sum > 35%, same idea for memory)
    const requestedUsage = extractNumbers(requestedQuota.developmentQuota.cpu)[0];
    const requestedUtilizationRate = (requestedUsage / totalUsage) * 100;
    if (requestedUtilizationRate > 34) {
      return true; // Auto-approval due to utilization percentage
    }
  }

  return false;
};

const checkIfResourceUtilized = async (requestedQuota: Quotas, licencePlate: string, cluster: string) => {
  const quotaTypes = ['cpu', 'memory'] as const;
  const namespaces = ['dev', 'test', 'prod', 'tools'] as const;

  // Create an array of promises for every combination of namespace and resource
  const utilizationChecks = _flatMap(namespaces, (namespace) =>
    // @ts-ignore
    _each(quotaTypes, (resource) => checkUtilization(requestedQuota, licencePlate, cluster, namespace, resource)),
  );

  // Resolve all promises and return true if any result is true
  const results = await Promise.all(utilizationChecks);

  return results.every((result) => result);
};

export const checkIfQuotaAutoApproval = (
  currentQuota: Quotas,
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: string,
) => {
  let hasIncreased = false;
  let hasIncreasedAlot = false;
  // @ts-ignore
  _each(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    _each(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      const resourceOrder = resourceOrders[resourceName as keyof Quota];

      const currentIndex = Object.values(resourceOrder).indexOf(currentVal);
      const requestedIndex = Object.values(resourceOrder).indexOf(requestedVal);

      const increased = requestedIndex > currentIndex;
      if (increased) {
        hasIncreased = true;
        if (!hasIncreasedAlot) {
          hasIncreasedAlot = requestedIndex - currentIndex > 1;
        }
        if (hasIncreasedAlot) return false;
      }
    });
  });

  if (hasIncreasedAlot) return false;
  if (!hasIncreased) return true;

  return checkIfResourceUtilized(requestedQuota, licencePlate, cluster);
};
