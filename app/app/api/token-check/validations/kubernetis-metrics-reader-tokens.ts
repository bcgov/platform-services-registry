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
