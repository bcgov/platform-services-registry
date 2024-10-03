import { KubeConfig, CoreV1Api, Metrics } from '@kubernetes/client-node';
import { Cluster } from '@prisma/client';
import { KLAB_METRICS_READER_TOKEN } from '@/config';

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

export function getK8sClients(cluster: Cluster) {
  const kc = k8sConfigs[cluster];
  const apiClient = kc.makeApiClient(CoreV1Api);
  const metricsClient = new Metrics(kc);

  return {
    apiClient,
    metricsClient,
  };
}
