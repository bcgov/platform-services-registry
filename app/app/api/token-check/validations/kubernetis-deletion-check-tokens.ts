import {
  CLAB_SERVICE_ACCOUNT_TOKEN,
  KLAB_SERVICE_ACCOUNT_TOKEN,
  KLAB2_SERVICE_ACCOUNT_TOKEN,
  GOLDDR_SERVICE_ACCOUNT_TOKEN,
  GOLD_SERVICE_ACCOUNT_TOKEN,
  SILVER_SERVICE_ACCOUNT_TOKEN,
  EMERALD_SERVICE_ACCOUNT_TOKEN,
} from '@/config';
import { Cluster } from '@/prisma/client';
import { createK8sClusterConfigs } from '@/services/k8s/helpers';

const { getK8sClusterToken, getK8sClusterClients } = createK8sClusterConfigs({
  [Cluster.KLAB]: KLAB_SERVICE_ACCOUNT_TOKEN,
  [Cluster.CLAB]: CLAB_SERVICE_ACCOUNT_TOKEN,
  [Cluster.KLAB2]: KLAB2_SERVICE_ACCOUNT_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_SERVICE_ACCOUNT_TOKEN,
  [Cluster.GOLD]: GOLD_SERVICE_ACCOUNT_TOKEN,
  [Cluster.SILVER]: SILVER_SERVICE_ACCOUNT_TOKEN,
  [Cluster.EMERALD]: EMERALD_SERVICE_ACCOUNT_TOKEN,
});

export async function validateKubernetisDeletionCheckTokens() {
  const results = {};

  await Promise.all(
    Object.values(Cluster).map(async (cluster) => {
      try {
        const token = getK8sClusterToken(cluster);
        if (!token) {
          results[cluster] = false;
          return;
        }

        const { authClient } = getK8sClusterClients(cluster);
        const res = await authClient.getAPIResources();

        results[cluster] = Array.isArray(res?.resources) && res.resources.length > 0;
      } catch (error) {
        results[cluster] = false;
      }
    }),
  );

  return results;
}
