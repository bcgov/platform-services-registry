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
import { validateK8sToken } from './helpers';

const tokenMap = {
  [Cluster.KLAB]: KLAB_METRICS_READER_TOKEN,
  [Cluster.CLAB]: CLAB_METRICS_READER_TOKEN,
  [Cluster.KLAB2]: KLAB2_METRICS_READER_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_METRICS_READER_TOKEN,
  [Cluster.GOLD]: GOLD_METRICS_READER_TOKEN,
  [Cluster.SILVER]: SILVER_METRICS_READER_TOKEN,
  [Cluster.EMERALD]: EMERALD_METRICS_READER_TOKEN,
};

export async function validateAllMetricsReaderTokens() {
  const results = {};

  for (const cluster of Object.values(Cluster)) {
    const token = tokenMap[cluster];
    results[cluster] = await validateK8sToken(cluster, token);
  }

  return results;
}
