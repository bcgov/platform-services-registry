import { KubeConfig, CoreV1Api, CustomObjectsApi, Metrics, AuthorizationV1Api } from '@kubernetes/client-node';
import { logger } from '@/core/logging';
import { Cluster } from '@/prisma/client';

export function configureKubeConfig(cluster: string, token: string) {
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
        token,
      },
    ],
    contexts: [
      {
        name: `${cluster}-context`,
        user: 'my-user',
        cluster,
      },
    ],
    currentContext: `${cluster}-context`,
  });

  return kc;
}

export function createK8sClusterConfigs(tokens: Record<Cluster, string>) {
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
    const kc = k8sConfigs[cluster];
    const user = kc.getCurrentUser();
    if (!user?.token) {
      logger.error(`Missing token in KubeConfig for cluster ${cluster}`);
      return null;
    }

    return user.token;
  }

  function getK8sClusterClients(cluster: Cluster) {
    const kc = k8sConfigs[cluster];

    return {
      apiClient: kc.makeApiClient(CoreV1Api),
      authClient: kc.makeApiClient(AuthorizationV1Api),
      metricsClient: new Metrics(kc),
      customClient: kc.makeApiClient(CustomObjectsApi),
    };
  }

  return {
    getK8sClusterToken,
    getK8sClusterClients,
  };
}
