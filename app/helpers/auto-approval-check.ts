import { Quota, Cluster } from '@prisma/client';
import _each from 'lodash-es/each';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/../app/constants';
import { ResourceType, getTotalMetrics } from '@/services/openshift-kubernetis-metrics/helpers';
import getPodMetrics from '@/services/openshift-kubernetis-metrics/usage-metrics';
import { extractNumbers } from '@/utils/string';

enum NamespaceNames {
  dev = 'developmentQuota',
  test = 'testQuota',
  prod = 'productionQuota',
  tools = 'toolsQuota',
}
export interface Quotas {
  testQuota: Quota;
  toolsQuota: Quota;
  developmentQuota: Quota;
  productionQuota: Quota;
}

// check if request contains quota change
export const checknoQuotaChange = (currentQuota: Quotas, requestedQuota: Quotas): boolean => {
  let noQuotaChange = true;
  // @ts-ignore
  _each(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    if (!noQuotaChange) return false; // Stop looping if a mismatch has already been found
    // @ts-ignore
    _each(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      if (extractNumbers(requestedVal)[0] !== extractNumbers(currentVal)[0]) {
        noQuotaChange = false;
        return;
      }
    });
  });
  return noQuotaChange;
};

// if quota was changed check if it was undngrade quota request
// TODO replace isQuotaUpgrade at app/emails/_templates/private-cloud/TeamEditRequest.tsx
export const checkIfQuotaUpgrade = (currentQuota: Quotas, requestedQuota: Quotas) => {
  let ifQuotaUpgrade = true;
  // @ts-ignore
  _each(currentQuota, (quota: Quota, envQuota: keyof Quotas) => {
    // @ts-ignore
    _each(quota, (resource: string, resourceName: keyof Quota) => {
      const currentVal = resource;
      const requestedVal = requestedQuota[envQuota][resourceName];
      ifQuotaUpgrade = extractNumbers(requestedVal)[0] > extractNumbers(currentVal)[0];
    });
  });
  return ifQuotaUpgrade;
};

const resourceOrders = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
};

// Helper function to check resource utilization
const checkUtilization = async (
  requestedQuota: Quotas,
  currentQuota: Quotas,
  licencePlate: string,
  cluster: Cluster,
  namespace: keyof typeof NamespaceNames,
  resource: ResourceType,
) => {
  const podMetricsData = await getPodMetrics(licencePlate, namespace, cluster);
  if (podMetricsData.length === 0) return false;

  const { totalUsage } = getTotalMetrics(podMetricsData, resource);
  const mesUnitsCoeff = resource === 'cpu' ? 1000 : 1024 * 1024;
  const totalLimit = extractNumbers(currentQuota[NamespaceNames[namespace]][resource])[1] * mesUnitsCoeff;

  // Check quota utilization
  // namespace already use 85% of total limit(i.e: kube_pod_container_resource_limits/namespace-total-limit)(CPU or memory, or storage)
  if (totalLimit && totalUsage) {
    const utilizationPercentage = (totalLimit / totalUsage) * 100;
    if (utilizationPercentage < 86) {
      return true; // Auto-approval due to utilization percentage
    }
    // Check quota usage
    // namespace has at least 35% of CPU utilization rate(namespace:container_cpu_usage/namespace_cpu:kube_pod_container_resource_requests:sum > 35%, same idea for memory)
    const requestedUsage = extractNumbers(requestedQuota[NamespaceNames[namespace]][resource])[0] * mesUnitsCoeff;
    const requestedUtilizationRate = (requestedUsage / totalUsage) * 100;
    if (requestedUtilizationRate > 34) {
      return true; // Auto-approval due to utilization percentage
    }
  }
  return false;
};

const checkIfResourceUtilized = async (
  requestedQuota: Quotas,
  currentQuota: Quotas,
  licencePlate: string,
  cluster: Cluster,
  namespaceNames: string[],
  resourceNames: string[],
) => {
  const filteredNamespaces = Object.keys(NamespaceNames).filter((key) =>
    namespaceNames.includes(NamespaceNames[key as keyof typeof NamespaceNames]),
  );

  // Create an array of promises for every combination of namespace and resource
  const utilizationChecks = filteredNamespaces.flatMap((namespace) =>
    resourceNames.map((resource) =>
      checkUtilization(
        requestedQuota,
        currentQuota,
        licencePlate,
        cluster,
        namespace as keyof typeof NamespaceNames,
        resource as ResourceType,
      ),
    ),
  );

  // Resolve all promises and return true if all results are true
  const results = await Promise.all(utilizationChecks);

  return results.every((result) => result);
};

export const checkIfQuotaAutoApproval = async (
  currentQuota: Quotas,
  requestedQuota: Quotas,
  licencePlate: string,
  cluster: Cluster,
) => {
  const noQuotaChange = checknoQuotaChange(currentQuota, requestedQuota);
  let isAutoApprovalAvailable = noQuotaChange;
  const namespaceNames: string[] = [];
  const resourceNames: string[] = [];
  if (!noQuotaChange) {
    let hasIncreasedSignificantly = false;

    const castCurrentQuota = {
      testQuota: currentQuota.testQuota,
      toolsQuota: currentQuota.toolsQuota,
      developmentQuota: currentQuota.developmentQuota,
      productionQuota: currentQuota.productionQuota,
    };

    // Iterate over each environment's quota
    // @ts-ignore
    _each(castCurrentQuota, (quota: Quota, envQuota: keyof Quotas) => {
      // Iterate over each resource in the quota
      // @ts-ignore
      // _each(quota, async (currentResource: string, resourceName: keyof Quota) => {
      _each(quota, (currentResource: string, resourceName: keyof Quota) => {
        const requestedResource = requestedQuota[envQuota][resourceName];
        const resourceOrder = resourceOrders[resourceName];

        const currentIndex = Object.keys(resourceOrder).indexOf(currentResource);
        const requestedIndex = Object.keys(resourceOrder).indexOf(requestedResource);

        const isIncreased = requestedIndex > currentIndex;
        if (isIncreased) {
          isAutoApprovalAvailable = false;
          // Check if the increase is significant(more than next tier)
          hasIncreasedSignificantly = requestedIndex - currentIndex > 1;
          if (hasIncreasedSignificantly) {
            isAutoApprovalAvailable = false;
            return;
          }
          // If not a significant increase, check resource utilization
          else if (!hasIncreasedSignificantly) {
            namespaceNames.push(envQuota);
            resourceNames.push(resourceName);
          }
        }
      });
    });
  }
  // TODO remove condition if storage metrics are availiabe
  if (resourceNames.indexOf('storage') === -1) {
    isAutoApprovalAvailable = await checkIfResourceUtilized(
      requestedQuota,
      currentQuota,
      licencePlate,
      cluster,
      namespaceNames,
      resourceNames,
    );
  }

  return { isAutoApprovalAvailable, noQuotaChange };
};
