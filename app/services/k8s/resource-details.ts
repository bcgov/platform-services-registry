import { Quota, Cluster, Env, ResourceType, QuotaUpgradeResourceDetail } from '@prisma/client';
import _each from 'lodash-es/each';
import { getTotalMetrics, memoryUnitMultipliers, cpuCoreToMillicoreMultiplier } from '@/helpers/resource-metrics';
import { getPodMetrics } from '@/services/k8s';
import { extractNumbers } from '@/utils/string';

export interface Quotas {
  testQuota: Quota;
  toolsQuota: Quota;
  developmentQuota: Quota;
  productionQuota: Quota;
}

const envQuotaToEnv = {
  developmentQuota: Env.dev,
  testQuota: Env.test,
  productionQuota: Env.prod,
  toolsQuota: Env.tools,
};

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
  resourceName: ResourceType;
  currentQuota: Quotas;
}) {
  const env = envQuotaToEnv[envQuota];
  const result: QuotaUpgradeResourceDetail = {
    env,
    resourceType: resourceName,
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

  const isStorage = resourceName === ResourceType.storage;
  const namespaceData = await getPodMetrics(licencePlate, env, cluster);
  const metricsData = isStorage ? namespaceData.pvcMetrics : namespaceData.podMetrics;

  if (metricsData.length === 0) return result;

  const { totalRequest, totalLimit, totalUsage } = getTotalMetrics(metricsData, resourceName);
  result.deployment.request = totalRequest;
  result.deployment.limit = totalLimit;
  result.deployment.usage = totalUsage;

  const unitMultiplier = resourceName === 'cpu' ? cpuCoreToMillicoreMultiplier : memoryUnitMultipliers.Gi;
  const resourceValues = extractNumbers(currentQuota[envQuota][resourceName]);
  const deploymentRequest = isStorage ? 0 : resourceValues[0] * unitMultiplier;
  const deploymentLimit = isStorage ? resourceValues[0] : resourceValues[1] * unitMultiplier;

  result.allocation.request = deploymentRequest;
  result.allocation.limit = deploymentLimit;

  return result;
}
