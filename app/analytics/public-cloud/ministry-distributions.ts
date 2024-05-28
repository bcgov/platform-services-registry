import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';

function getAggByProvider(provider?: string) {
  const pipeline: Prisma.InputJsonValue[] = provider
    ? [
        {
          $match: {
            status: { $eq: 'ACTIVE' },
            provider: { $regex: provider, $options: 'i' },
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

  return prisma.publicCloudProject.aggregateRaw({ pipeline });
}

export async function ministryDistributions() {
  const res = await Promise.all([getAggByProvider('AWS')]);

  return res as unknown as { _id: string; value: number }[][];
}
