import { PodMetric } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu, PVC, resourceMetrics } from '@/helpers/resource-metrics';
import { getK8sClients, queryPrometheus } from './core';

async function getLastHourAvgUsage(namespace: string, cluster: Cluster) {
  const queryFilter = `namespace="${namespace}"`;
  const cpuUsageQuery = `sum by (pod) (irate(container_cpu_usage_seconds_total{${queryFilter}}[1m]))`;
  const memoryUsageQuery = `sum by (pod) (avg_over_time(container_memory_usage_bytes{${queryFilter}}[1h]))`;

  const [usageCPU, usageMemory] = await Promise.all(
    [cpuUsageQuery, memoryUsageQuery].map((query) => queryPrometheus(query, cluster)),
  );

  // Handle missing data and fallback to zeros
  const usageData = usageCPU.map((cpuItem) => {
    const podName = cpuItem.metric.pod;
    const cpuUsage = cpuItem.value ? parseFloat(cpuItem.value[1]) : 0;

    // Match memory usage for the same pod
    const memoryUsageItem = usageMemory.find((memItem) => memItem.metric.pod === podName);
    const memoryUsage = memoryUsageItem && memoryUsageItem.value ? parseFloat(memoryUsageItem.value[1]) : 0;

    return {
      podName,
      usage: {
        cpu: cpuUsage,
        memory: memoryUsage,
      },
    };
  });

  return usageData;
}

async function getPvcUsage(name: string, namespace: string, cluster: Cluster) {
  const queryFilter = `persistentvolumeclaim="${name}", namespace="${namespace}"`;
  const [usageQuery, capacityQuery, freeInodesQuery] = [
    `avg_over_time(kubelet_volume_stats_used_bytes{${queryFilter}}[1h])`,
    `kubelet_volume_stats_capacity_bytes{${queryFilter}}`,
    `kubelet_volume_stats_inodes_free{${queryFilter}}`,
  ];

  const [usageResult, capacityResult, freeInodesResult] = await Promise.all(
    [usageQuery, capacityQuery, freeInodesQuery].map((query) => queryPrometheus(query, cluster)),
  );

  if (usageResult.length === 0 || capacityResult.length === 0 || freeInodesResult.length === 0) {
    return null;
  }
  // each result array contains a single item with a timestamp and value:
  // Example: { value: [timestamp, value] }
  const [, usageStr] = usageResult[0].value;
  const [, limitsStr] = capacityResult[0].value;
  const [, freeInodesStr] = freeInodesResult[0].value;

  const usage = parseFloat(usageStr);
  const limits = parseFloat(limitsStr);
  const freeInodes = parseInt(freeInodesStr, 10);

  return { usage, limits, freeInodes };
}

async function collectPVCMetrics(namespace: string, cluster: Cluster) {
  const { apiClient } = getK8sClients(cluster);
  const res = await apiClient.listNamespacedPersistentVolumeClaim(namespace);
  const pvcs = res.body.items;
  const pvcPromises = pvcs.map(async (pvc) => {
    const pvcName = pvc.metadata?.name;
    if (!pvcName) return null;

    const pvcMetricsNums = await getPvcUsage(pvcName, namespace, cluster);

    if (!pvcMetricsNums) return null;
    return {
      ...pvcMetricsNums,
      name: pvcName,
      pvName: pvc.spec?.volumeName || '',
      storageClassName: pvc.spec?.storageClassName || '',
    };
  });
  const usagePVCData = (await Promise.all(pvcPromises)).filter((pvc) => pvc !== null) as PVC[];
  return usagePVCData;
}

export async function getPodMetrics(
  licencePlate: string,
  environment: string,
  cluster: Cluster,
): Promise<resourceMetrics> {
  const { apiClient, metricsClient } = getK8sClients(cluster);
  const usageData: resourceMetrics = { podMetrics: [], pvcMetrics: [] };

  const namespace = `${licencePlate}-${environment}`;
  let metricItems: PodMetric[] = [];
  let podUsageData: { podName: string; usage: { cpu: number; memory: number } }[] = [];

  try {
    const pvc = await collectPVCMetrics(namespace, cluster); // PVC metrics collection
    podUsageData = await getLastHourAvgUsage(namespace, cluster); // CPU and memory by pod usage data collection
    const metrics = await metricsClient.getPodMetrics(namespace);
    if ((!metrics.items || metrics.items.length === 0) && (!pvc || pvc.length === 0)) {
      return { podMetrics: [], pvcMetrics: [] };
    }
    usageData.pvcMetrics = pvc || [];
    metricItems = metrics.items;
  } catch (error: any) {
    logger.error(error.body);
    return { podMetrics: [], pvcMetrics: [] };
  }

  // Organize usage data by pod name for easy lookup
  const usageMap = podUsageData.reduce(
    (acc, { podName, usage }) => {
      acc[podName] = usage;
      return acc;
    },
    {} as Record<string, { cpu: number; memory: number }>,
  );

  // Iterate through each pod and its containers to extract usage metrics
  for (const item of metricItems) {
    const name = item.metadata.name;
    const podStatus = await apiClient.readNamespacedPodStatus(name, namespace);

    // Map over containers to collect their usage, limits, and requests
    const containers = item.containers
      .filter((container) => {
        if (container.name === 'POD') return false;
        return true;
      })
      .map((container, index) => {
        const resourceDef = podStatus.body.spec?.containers[index]?.resources ?? {};

        // Retrieve last hour usage for CPU and memory from usageMap
        const lastHourUsage = usageMap[name] || { cpu: 0, memory: 0 };

        return {
          name: container.name,
          usage: {
            cpu: normalizeCpu(lastHourUsage.cpu) as number,
            memory: normalizeMemory(lastHourUsage.memory) as number,
          },
          limits: {
            cpu: normalizeCpu(resourceDef.limits?.cpu || 0) as number,
            memory: normalizeMemory(resourceDef.limits?.memory || 0) as number,
          },
          requests: {
            cpu: normalizeCpu(resourceDef.requests?.cpu || 0) as number,
            memory: normalizeMemory(resourceDef.requests?.memory || 0) as number,
          },
        };
      });

    const podResources = {
      name,
      containers,
    };
    usageData.podMetrics.push(podResources);
  }
  return usageData;
}

// export async function getPodMetrics(
//   licencePlate: string,
//   environment: string,
//   cluster: Cluster,
// ): Promise<resourceMetrics> {
//   const { apiClient, metricsClient } = getK8sClients(cluster);
//   const usageData: resourceMetrics = { podMetrics: [], pvcMetrics: [] };

//   const namespace = `${licencePlate}-${environment}`;
//   let metricItems: PodMetric[] = [];

//   try {
//     const pvc = await collectPVCMetrics(namespace, cluster);
//     const metrics = await metricsClient.getPodMetrics(namespace);
//     if ((!metrics.items || metrics.items.length === 0) && (!pvc || pvc.length === 0)) {
//       return { podMetrics: [], pvcMetrics: [] };
//     }
//     usageData.pvcMetrics = pvc || [];
//     metricItems = metrics.items;
//   } catch (error: any) {
//     logger.error(error.body);
//     return { podMetrics: [], pvcMetrics: [] };
//   }

//   // Iterate through each pod and its containers to extract usage metrics
//   for (const item of metricItems) {
//     const name = item.metadata.name;
//     const podStatus = await apiClient.readNamespacedPodStatus(name, namespace);

//     // Map over containers to collect their usage, limits, and requests
//     const containers = item.containers
//       .filter((container) => {
//         if (container.name === 'POD' && container.usage.cpu === '0' && container.usage.memory === '0') return false;
//         return true;
//       })
//       .map((container, index) => {
//         const resourceDef = podStatus.body.spec?.containers[index]?.resources ?? {};

//         return {
//           name: container.name,
//           usage: {
//             cpu: normalizeCpu(container.usage.cpu) || 0,
//             memory: normalizeMemory(container.usage.memory) || 0,
//           },
//           limits: {
//             cpu: normalizeCpu(resourceDef.limits?.cpu || '0'),
//             memory: normalizeMemory(resourceDef.limits?.memory || '0'),
//           },
//           requests: {
//             cpu: normalizeCpu(resourceDef.requests?.cpu || '0'),
//             memory: normalizeMemory(resourceDef.requests?.memory || '0'),
//           },
//         };
//       });
//     const podResources = {
//       name,
//       containers,
//     };
//     usageData.podMetrics.push(podResources);
//   }
//   return usageData;
// }
