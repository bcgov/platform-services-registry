import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { KLAB_METRICS_READER_TOKEN, IS_PROD, IS_TEST } from '@/config';
import { logger } from '@/core/logging';
import { normalizeMemory, normalizeCpu, Pod } from './helpers';

const clusterMetricsReaderToken = {
  KLAB: KLAB_METRICS_READER_TOKEN,
  CLAB: ' ',
  KLAB2: ' ',
  GOLDDR: ' ',
  GOLD: ' ',
  SILVER: ' ',
  EMERALD: ' ',
};

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

export default async function getPodMetrics(licencePlate: string, environment: string, cluster: Cluster) {
  if (!(IS_PROD || IS_TEST)) {
    licencePlate = 'f6ee34';
    cluster = 'KLAB';
  }

  const systemNamespace = `${licencePlate}-${environment}`;

  const token = clusterMetricsReaderToken[cluster];

  if (!token) {
    throw new Error(`No token found for cluster: ${cluster}`);
  }

  const kc = configureKubeConfig(cluster, token);
  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
  const usageData: Pod[] = [];

  const metrics = await metricsClient.getPodMetrics(systemNamespace);
  if (!metrics.items || metrics.items.length === 0) {
    logger.error(`No metrics found for namespace: ${systemNamespace}`);
    return [];
  }

  // Iterate through each pod and its containers to extract usage metrics
  for (const item of metrics.items) {
    const podName = item.metadata.name;
    const podStatus = await k8sApi.readNamespacedPodStatus(podName, systemNamespace);

    // Map over containers to collect their usage, limits, and requests
    const containers = item.containers.map(
      (container: { name: string; usage: { cpu: string; memory: string } }, index: number) => {
        return {
          name: container.name,
          usage: {
            cpu: normalizeCpu(container.usage.cpu) || 0,
            memory: normalizeMemory(container.usage.memory) || 0,
          },
          limits: {
            cpu: normalizeCpu(podStatus.body.spec?.containers[index]?.resources?.limits?.cpu || '0'),
            memory: normalizeMemory(podStatus.body.spec?.containers[index]?.resources?.limits?.memory || '0'),
          },
          requests: {
            cpu: normalizeCpu(podStatus.body.spec?.containers[index]?.resources?.requests?.cpu || '0'),
            memory: normalizeMemory(podStatus.body.spec?.containers[index]?.resources?.requests?.memory || '0'),
          },
        };
      },
    );

    const podResources = {
      podName: podName,
      containers: containers,
    };

    usageData.push(podResources);
  }
  return usageData;
}
