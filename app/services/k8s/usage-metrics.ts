import { PodMetric } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu, PVC, resourceMetrics } from '@/helpers/resource-metrics';
import { getK8sClients, queryPrometheus } from './core';

async function getPvcUsage(name: string, namespace: string, cluster: Cluster) {
  const queries = {
    usage: `kubelet_volume_stats_used_bytes{persistentvolumeclaim="${name}", namespace="${namespace}"}`,
    capacity: `kubelet_volume_stats_capacity_bytes{persistentvolumeclaim="${name}", namespace="${namespace}"}`,
    freeInodes: `kubelet_volume_stats_inodes_free{persistentvolumeclaim="${name}", namespace="${namespace}"}`,
  };
  try {
    const [usageResult, capacityResult, freeInodesResult] = await Promise.all(
      Object.values(queries).map((query) => queryPrometheus(query, cluster)),
    );

    if (usageResult.length && capacityResult.length && freeInodesResult.length) {
      const usage = parseFloat(usageResult[0].value[1]);
      const limits = parseFloat(capacityResult[0].value[1]);
      const freeInodes = parseInt(freeInodesResult[0].value[1], 10);

      return { usage, limits, freeInodes };
    }
  } catch (error) {
    console.error(`Error fetching metrics for PVC: ${name}`, error);
  }
}

async function collectPVCMetrics(namespace: string, cluster: Cluster) {
  const { apiClient } = getK8sClients(cluster);
  try {
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
  } catch (error) {
    console.error(`Error fetching PVCs from namespace ${namespace}:`, error);
  }
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

  try {
    const pvc = await collectPVCMetrics(namespace, cluster);
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

  // Iterate through each pod and its containers to extract usage metrics
  for (const item of metricItems) {
    const name = item.metadata.name;
    const podStatus = await apiClient.readNamespacedPodStatus(name, namespace);

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
      name,
      containers,
    };
    usageData.podMetrics.push(podResources);
  }
  return usageData;
}
