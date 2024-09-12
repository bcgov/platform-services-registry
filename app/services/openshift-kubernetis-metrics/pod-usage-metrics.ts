import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { KLAB_METRICS_READER_TOKEN, IS_PROD } from '@/config';
import { UsageObj, convertValues } from './helpers';

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
  if (!IS_PROD) {
    licencePlate = 'f6ee34';
    cluster = 'klab';
  }

  const systemNamespace = licencePlate + '-' + environment;
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

  const kc = configureKubeConfig(cluster, CLUSTER_METRICS_READER_TOKEN[clusterName]);
  const k8sApi = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);
  const usageData: UsageObj[] = [];

  try {
    const metrics = await metricsClient.getPodMetrics(systemNamespace);

    for (const item of metrics.items) {
      const podName = item.metadata.name;
      const podStatus = await k8sApi.readNamespacedPodStatus(podName, systemNamespace);

      const podResources: UsageObj = {
        name: podName,
        usage: item.containers[0].usage,
        limits: {
          cpu: podStatus.body.spec?.containers[0].resources?.limits?.cpu || '',
          memory: podStatus.body.spec?.containers[0].resources?.limits?.memory || '',
        },
        requests: {
          cpu: podStatus.body.spec?.containers[0].resources?.requests?.cpu || '',
          memory: podStatus.body.spec?.containers[0].resources?.requests?.memory || '',
        },
      };
      usageData.push(podResources);
    }

    return convertValues(usageData);
  } catch (error) {
    console.error('Error fetching pod metrics:', error);
  }
}
