import { KubeConfig, CoreV1Api, PodMetric, Metrics } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { KLAB_METRICS_READER_TOKEN, IS_PROD, IS_TEST } from '@/config';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu, Pod } from '@/helpers/resource-metrics';

function configureKubeConfig(cluster: string, token: string) {
  const kc = new KubeConfig();
  kc.loadFromOptions({
    clusters: [
      {
        name: cluster,
        server: `https://api.${cluster}.devops.gov.bc.ca:6443`,
        skipTLSVerify: false,
      },
    ],
    users: [
      {
        name: 'my-user',
        token: token,
      },
    ],
    contexts: [
      {
        name: `${cluster}-context`,
        user: 'my-user',
        cluster: cluster,
      },
    ],
    currentContext: `${cluster}-context`,
  });

  return kc;
}

const k8sConfigs = {
  [Cluster.KLAB]: configureKubeConfig(Cluster.KLAB, KLAB_METRICS_READER_TOKEN),
  [Cluster.CLAB]: configureKubeConfig(Cluster.CLAB, KLAB_METRICS_READER_TOKEN),
  [Cluster.KLAB2]: configureKubeConfig(Cluster.KLAB2, KLAB_METRICS_READER_TOKEN),
  [Cluster.GOLDDR]: configureKubeConfig(Cluster.GOLDDR, KLAB_METRICS_READER_TOKEN),
  [Cluster.GOLD]: configureKubeConfig(Cluster.GOLD, KLAB_METRICS_READER_TOKEN),
  [Cluster.SILVER]: configureKubeConfig(Cluster.SILVER, KLAB_METRICS_READER_TOKEN),
  [Cluster.EMERALD]: configureKubeConfig(Cluster.EMERALD, KLAB_METRICS_READER_TOKEN),
};

export async function getPodMetrics(licencePlate: string, environment: string, cluster: Cluster) {
  const kc = k8sConfigs[cluster];
  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
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
    const podStatus = await k8sApi.readNamespacedPodStatus(podName, namespace);

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
