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
import { validateK8sToken } from './helpers';

const tokenMap = {
  [Cluster.KLAB]: KLAB_SERVICE_ACCOUNT_TOKEN,
  [Cluster.CLAB]: CLAB_SERVICE_ACCOUNT_TOKEN,
  [Cluster.KLAB2]: KLAB2_SERVICE_ACCOUNT_TOKEN,
  [Cluster.GOLDDR]: GOLDDR_SERVICE_ACCOUNT_TOKEN,
  [Cluster.GOLD]: GOLD_SERVICE_ACCOUNT_TOKEN,
  [Cluster.SILVER]: SILVER_SERVICE_ACCOUNT_TOKEN,
  [Cluster.EMERALD]: EMERALD_SERVICE_ACCOUNT_TOKEN,
};

export async function validateAllServiceAccountTokens() {
  const results = {};

  for (const cluster of Object.values(Cluster)) {
    const token = tokenMap[cluster];
    results[cluster] = await validateK8sToken(cluster, token);
  }

  return results;
}
