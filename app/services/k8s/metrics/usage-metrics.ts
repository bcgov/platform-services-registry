import { environmentShortNames } from '@/constants';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu } from '@/helpers/resource-metrics';
import { Cluster, ResourceRequestsEnv } from '@/prisma/client';
import type { UsageMetrics } from '@/types/usage';
import { getK8sClients, queryPrometheus } from './core';

async function getLastTwoWeeksAvgUsage(cluster: Cluster, namespace: string, podName: string) {
  const queryFilter = `namespace="${namespace}", pod="${podName}"`;
  const cpuUsageQuery = `avg by (container) (rate(container_cpu_usage_seconds_total{${queryFilter}}[2w]))`;
  const memoryUsageQuery = `avg by (container) (avg_over_time(container_memory_usage_bytes{${queryFilter}}[2w]))`;

  const [usageCPU, usageMemory] = await Promise.all(
    [cpuUsageQuery, memoryUsageQuery].map((query) => queryPrometheus(query, cluster)),
  );

  // Handle missing data and fallback to zeros
  const usageData = usageCPU.map((cpuItem) => {
    const containerName = cpuItem.metric.container;
    const cpuUsage = cpuItem.value ? parseFloat(cpuItem.value[1]) : 0;

    // Match memory usage for the same container
    const memoryUsageItem = usageMemory.find((memItem) => memItem.metric.container === containerName);
    const memoryUsage = memoryUsageItem?.value ? parseFloat(memoryUsageItem.value[1]) : 0;

    return {
      containerName,
      usage: {
        cpu: cpuUsage,
        memory: memoryUsage,
      },
    };
  });

  return usageData;
}

async function getPvcUsage(cluster: Cluster, namespace: string, name: string) {
  const queryFilter = `persistentvolumeclaim="${name}", namespace="${namespace}"`;
  const [usageQuery, capacityQuery, freeInodesQuery] = [
    `kubelet_volume_stats_used_bytes{${queryFilter}}`,
    `kubelet_volume_stats_capacity_bytes{${queryFilter}}`,
    `kubelet_volume_stats_inodes_free{${queryFilter}}`,
  ];

  const [usageResult, capacityResult, freeInodesResult] = await Promise.all(
    [usageQuery, capacityQuery, freeInodesQuery].map((query) => queryPrometheus(query, cluster)),
  );

  if (usageResult.length === 0 || capacityResult.length === 0 || freeInodesResult.length === 0) {
    return { usage: 0, requests: 0, freeInodes: 0 };
  }
  // each result array contains a single item with a timestamp and value:
  // Example: { value: [timestamp, value] }
  const [, usageStr] = usageResult[0].value;
  const [, requestsStr] = capacityResult[0].value;
  const [, freeInodesStr] = freeInodesResult[0].value;

  const usage = parseFloat(usageStr);
  const requests = parseFloat(requestsStr);
  const freeInodes = parseInt(freeInodesStr, 10);

  return { usage, requests, freeInodes };
}

async function getPvcMetrics(cluster: Cluster, namespace: string) {
  const { apiClient } = getK8sClients(cluster);
  const res = await apiClient.listNamespacedPersistentVolumeClaim({ namespace });
  const pvcs = res.items;

  const pvcPromises = pvcs.map(async (pvc) => {
    const pvcName = pvc.metadata?.name;
    if (!pvcName) return null;

    const pvcMetricsNums = await getPvcUsage(cluster, namespace, pvcName);

    return {
      ...pvcMetricsNums,
      name: pvcName,
      pvName: pvc.spec?.volumeName || '',
      storageClassName: pvc.spec?.storageClassName || '',
    };
  });

  const pvcMetrics = (await Promise.all(pvcPromises)).filter((pvc) => pvc !== null);
  return pvcMetrics;
}

async function getPodMetrics(cluster: Cluster, namespace: string) {
  const { apiClient, metricsClient } = getK8sClients(cluster);
  const metrics = await metricsClient.getPodMetrics(namespace);

  if (!metrics.items || metrics.items.length === 0) {
    return [];
  }

  const podMetrics = await Promise.all(
    metrics.items.map(async (item) => {
      const podName = item.metadata.name;

      // Collect average CPU and memory usage for the specific pod
      const avgUsage = await getLastTwoWeeksAvgUsage(cluster, namespace, podName);

      // Create a map for quick lookup of usage data by container name
      const usageMap = avgUsage.reduce(
        (acc, { containerName, usage }) => {
          acc[containerName] = usage;
          return acc;
        },
        {} as Record<string, { cpu: number; memory: number }>,
      );

      const podStatus = await apiClient.readNamespacedPodStatus({ name: podName, namespace });

      const containers = item.containers
        .filter((container) => container.name !== 'POD') // Exclude pseudo-container
        .map((container) => {
          // The name of each app and init container in a Pod must be unique
          // https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#containers
          const resourceDef = podStatus.spec?.containers.find((cont) => cont.name === container.name);

          if (!resourceDef) {
            logger.warn(`No resource found for container: ${container.name}`);
            return null;
          }

          // Retrieve last two weeks usage for the container
          const lastTwoWeeksUsage = usageMap[container.name] || { cpu: 0, memory: 0 };

          return {
            name: container.name,
            usage: {
              cpu: normalizeCpu(lastTwoWeeksUsage.cpu),
              memory: normalizeMemory(lastTwoWeeksUsage.memory),
            },
            requests: {
              cpu: normalizeCpu(resourceDef.resources?.requests?.cpu || 0),
              memory: normalizeMemory(resourceDef.resources?.requests?.memory || 0),
            },
          };
        })
        .filter((container) => container !== null);

      return {
        name: podName,
        containers,
      };
    }),
  );

  return podMetrics;
}

export async function getUsageMetrics(
  licencePlate: string,
  environment: keyof ResourceRequestsEnv,
  cluster: Cluster,
): Promise<UsageMetrics> {
  const namespace = `${licencePlate}-${environmentShortNames[environment]}`;

  const [pvcMetrics, podMetrics] = await Promise.all([
    getPvcMetrics(cluster, namespace),
    getPodMetrics(cluster, namespace),
  ]);

  return {
    pvcMetrics,
    podMetrics,
  };
}
