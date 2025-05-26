import { getTotalMetrics, memoryUnitMultipliers, cpuCoreToMillicoreMultiplier } from '@/helpers/resource-metrics';
import {
  Cluster,
  ResourceType,
  QuotaUpgradeResourceDetail,
  ResourceRequestsEnv,
  ResourceRequests,
} from '@/prisma/client';
import { getUsageMetrics } from '@/services/k8s/metrics';

export async function getResourceDetails({
  licencePlate,
  cluster,
  env,
  resourceName,
  currentResourceRequests,
}: {
  licencePlate: string;
  cluster: Cluster;
  env: keyof ResourceRequestsEnv;
  resourceName: keyof ResourceRequests;
  currentResourceRequests: ResourceRequestsEnv;
}) {
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
  const metrics = await getUsageMetrics(licencePlate, env, cluster);
  const metricsData = isStorage ? metrics.pvcMetrics : metrics.podMetrics;
  if (metricsData.length === 0) return result;

  const { totalRequest, totalUsage } = getTotalMetrics(metricsData, resourceName);
  result.deployment.request = totalRequest;
  result.deployment.usage = totalUsage;

  const unitMultiplier = resourceName === 'cpu' ? cpuCoreToMillicoreMultiplier : memoryUnitMultipliers.Gi;
  const resourceValue = currentResourceRequests[env][resourceName];
  const deploymentRequest = resourceValue * unitMultiplier;

  result.allocation.request = deploymentRequest;
  return result;
}
