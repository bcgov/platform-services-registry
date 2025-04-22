import { KubeConfig, CoreV1Api, CustomObjectsApi, Metrics } from '@kubernetes/client-node';
import { Cluster } from '@/prisma/types';

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

export function createK8sClusterConfigs(tokens: {
  [Cluster.KLAB]: string;
  [Cluster.CLAB]: string;
  [Cluster.KLAB2]: string;
  [Cluster.GOLDDR]: string;
  [Cluster.GOLD]: string;
  [Cluster.SILVER]: string;
  [Cluster.EMERALD]: string;
}) {
  const k8sConfigs = {
    [Cluster.KLAB]: configureKubeConfig(Cluster.KLAB, tokens[Cluster.KLAB]),
    [Cluster.CLAB]: configureKubeConfig(Cluster.CLAB, tokens[Cluster.CLAB]),
    [Cluster.KLAB2]: configureKubeConfig(Cluster.KLAB2, tokens[Cluster.KLAB2]),
    [Cluster.GOLDDR]: configureKubeConfig(Cluster.GOLDDR, tokens[Cluster.GOLDDR]),
    [Cluster.GOLD]: configureKubeConfig(Cluster.GOLD, tokens[Cluster.GOLD]),
    [Cluster.SILVER]: configureKubeConfig(Cluster.SILVER, tokens[Cluster.SILVER]),
    [Cluster.EMERALD]: configureKubeConfig(Cluster.EMERALD, tokens[Cluster.EMERALD]),
  };

  function getK8sClusterToken(cluster: Cluster) {
    return k8sConfigs[cluster];
  }

  function getK8sClusterClients(cluster: Cluster) {
    const kc = k8sConfigs[cluster];
    const apiClient = kc.makeApiClient(CoreV1Api);
    const metricsClient = new Metrics(kc);
    const customClient = kc.makeApiClient(CustomObjectsApi);

    return {
      apiClient,
      metricsClient,
      customClient,
    };
  }

  return {
    getK8sClusterToken,
    getK8sClusterClients,
  };
}
