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
import { isClusterTokenPresent } from './helpers';

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

  for (const cluster of Object.values(Cluster)) {
    if (!isClusterTokenPresent(getK8sClusterToken, cluster)) {
      results[cluster] = false;
      continue;
    }

    const { authClient } = getK8sClusterClients(cluster);
    const res = await authClient.getAPIResources();

    results[cluster] = !!res && Array.isArray(res.resources) && res.resources.length > 0;
  }

  return results;
}
