import {
  CLAB_METRICS_READER_TOKEN,
  KLAB_METRICS_READER_TOKEN,
  KLAB2_METRICS_READER_TOKEN,
  GOLDDR_METRICS_READER_TOKEN,
  GOLD_METRICS_READER_TOKEN,
  SILVER_METRICS_READER_TOKEN,
  EMERALD_METRICS_READER_TOKEN,
} from '@/config';
import { Cluster } from '@/prisma/client';
import { createK8sClusterConfigs } from '@/services/k8s/helpers';
import { isClusterTokenPresent } from './helpers';

const { getK8sClusterToken, getK8sClusterClients } = createK8sClusterConfigs({
  [Cluster.KLAB]: KLAB_METRICS_READER_TOKEN,
  [Cluster.CLAB]: CLAB_METRICS_READER_TOKEN,
  [Cluster.KLAB2]: KLAB2_METRICS_READER_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_METRICS_READER_TOKEN,
  [Cluster.GOLD]: GOLD_METRICS_READER_TOKEN,
  [Cluster.SILVER]: SILVER_METRICS_READER_TOKEN,
  [Cluster.EMERALD]: EMERALD_METRICS_READER_TOKEN,
});

export async function validateKubernetisMetricsReaderTokens() {
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
