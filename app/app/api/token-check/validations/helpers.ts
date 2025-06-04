import { CoreV1Api } from '@kubernetes/client-node';
import { logger } from '@/core/logging';
import { Cluster } from '@/prisma/client';
import { configureKubeConfig } from '@/services/k8s/helpers';

export async function validateOCTokens(tokenMap: Record<Cluster, string>) {
  const results = {};

  for (const cluster of Object.values(Cluster)) {
    const token = tokenMap[cluster];
    try {
      const api = configureKubeConfig(cluster, token).makeApiClient(CoreV1Api);
      await api.getAPIResources();
      results[cluster] = true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Token check failed for ${cluster}:`, error.message);
      } else {
        logger.error('Unexpected error', error);
      }
      results[cluster] = false;
    }
  }

  return results;
}
