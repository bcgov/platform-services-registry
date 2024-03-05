import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';

function getAggByCluster(cluster?: string) {
  const pipeline: Prisma.InputJsonValue[] = cluster
    ? [
        {
          $match: {
            status: { $eq: 'ACTIVE' },
            cluster: { $regex: cluster, $options: 'i' },
          },
        },
      ]
    : [
        {
          $match: {
            status: { $eq: 'ACTIVE' },
          },
        },
      ];

  pipeline.push({
    $group: {
      _id: '$ministry',
      value: { $count: {} },
    },
  });

  return prisma.privateCloudProject.aggregateRaw({ pipeline });
}

export async function ministryDistributions() {
  const res = await Promise.all([
    getAggByCluster(),
    getAggByCluster('SILVER'),
    getAggByCluster('GOLD'),
    getAggByCluster('EMERALD'),
  ]);

  return res as unknown as { _id: string; value: number }[][];
}
