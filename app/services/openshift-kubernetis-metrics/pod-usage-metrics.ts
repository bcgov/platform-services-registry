import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { KLAB_METRICS_READER_TOKEN, IS_PROD, IS_TEST } from '@/config';
import { Container, convertValues, Pod } from './helpers';

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

export default async function getPodMetrics(licencePlate: string, environment: string, cluster: string) {
  if (!(IS_PROD || IS_TEST)) {
    licencePlate = 'f6ee34';
    cluster = 'klab';
  }

  const systemNamespace = `${licencePlate}-${environment}`;
  const CLUSTER_METRICS_READER_TOKEN = {
    // clab: CLAB_METRICS_READER_TOKEN || '',
    klab: KLAB_METRICS_READER_TOKEN || '',
    // klab2: KLAB2_METRICS_READER_TOKEN || '',
    // golddr: GOLDDR_METRICS_READER_TOKEN || '',
    // gold: GOLD_METRICS_READER_TOKEN || '',
    // silver: SILVER_METRICS_READER_TOKEN || '',
    // emerald: EMERALD_METRICS_READER_TOKEN || '',
  };

  const clusterName = cluster.toLowerCase() as keyof typeof CLUSTER_METRICS_READER_TOKEN;
  const token = CLUSTER_METRICS_READER_TOKEN[clusterName];

  if (!token) {
    throw new Error(`No token found for cluster: ${clusterName}`);
  }

  const kc = configureKubeConfig(cluster, token);
  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
  const usageData: Pod[] = [];

  try {
    const metrics = await metricsClient.getPodMetrics(systemNamespace);
    if (!metrics.items || metrics.items.length === 0) {
      console.warn(`No metrics found for namespace: ${systemNamespace}`);
      return [];
    }

    // Iterate through each pod and its containers to extract usage metrics
    for (const item of metrics.items) {
      const podName = item.metadata.name;
      const podStatus = await k8sApi.readNamespacedPodStatus(podName, systemNamespace);

      // Map over containers to collect their usage, limits, and requests
      const containers: Container[] = item.containers.map(
        (container: { name: string; usage: { cpu: string; memory: string } }, index: number) => {
          return {
            name: container.name,
            usage: {
              cpu: container.usage.cpu || '0',
              memory: container.usage.memory || '0',
            },
            limits: {
              cpu: podStatus.body.spec?.containers[index]?.resources?.limits?.cpu || '0',
              memory: podStatus.body.spec?.containers[index]?.resources?.limits?.memory || '0',
            },
            requests: {
              cpu: podStatus.body.spec?.containers[index]?.resources?.requests?.cpu || '0',
              memory: podStatus.body.spec?.containers[index]?.resources?.requests?.memory || '0',
            },
          };
        },
      );

      const podResources: Pod = {
        podName: podName,
        containers: containers,
      };
      // console.log('podResources', JSON.stringify(podResources, null, 2))
      usageData.push(podResources);
    }
    return convertValues(usageData);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching pod metrics:', error.message);
      throw new Error(`Failed to fetch pod metrics for namespace: ${systemNamespace}. Error: ${error.message}`);
    } else {
      console.error('Unknown error occurred:', error);
      throw new Error(`Failed to fetch pod metrics for namespace: ${systemNamespace}. Unknown error.`);
    }
  }
}
