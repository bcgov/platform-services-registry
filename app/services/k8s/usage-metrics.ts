import { PodMetric } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu, Pod } from '@/helpers/resource-metrics';
import { getK8sClients } from './core';

export async function getPodMetrics(licencePlate: string, environment: string, cluster: Cluster) {
  const { apiClient, metricsClient } = getK8sClients(cluster);
  const usageData: Pod[] = [];

  const namespace = `${licencePlate}-${environment}`;
  let metricItems: PodMetric[] = [];

  try {
    const metrics = await metricsClient.getPodMetrics(namespace);
    if (!metrics.items || metrics.items.length === 0) {
      return [];
    }

    metricItems = metrics.items;
  } catch (error: any) {
    logger.error(error.body);
    return [];
  }

  // Iterate through each pod and its containers to extract usage metrics
  for (const item of metricItems) {
    const podName = item.metadata.name;
    const podStatus = await apiClient.readNamespacedPodStatus(podName, namespace);

    // Map over containers to collect their usage, limits, and requests
    const containers = item.containers
      .filter((container) => {
        if (container.name === 'POD' && container.usage.cpu === '0' && container.usage.memory === '0') return false;
        return true;
      })
      .map((container, index) => {
        const resourceDef = podStatus.body.spec?.containers[index]?.resources ?? {};

        return {
          name: container.name,
          usage: {
            cpu: normalizeCpu(container.usage.cpu) || 0,
            memory: normalizeMemory(container.usage.memory) || 0,
          },
          limits: {
            cpu: normalizeCpu(resourceDef.limits?.cpu || '0'),
            memory: normalizeMemory(resourceDef.limits?.memory || '0'),
          },
          requests: {
            cpu: normalizeCpu(resourceDef.requests?.cpu || '0'),
            memory: normalizeMemory(resourceDef.requests?.memory || '0'),
          },
        };
      });

    const podResources = {
      podName,
      containers,
    };

    usageData.push(podResources);
  }
  return usageData;
}
