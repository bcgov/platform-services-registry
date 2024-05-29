import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { getProdClusterLicencePlates } from './common';

function getAggByCluster(prodClusterLicencePlates: string[], cluster?: string) {
  const pipeline: Prisma.InputJsonValue[] = cluster
    ? [
        {
          $match: {
            licencePlate: { $in: prodClusterLicencePlates },
            status: { $eq: 'ACTIVE' },
            cluster: { $regex: cluster, $options: 'i' },
          },
        },
      ]
    : [
        {
          $match: {
            licencePlate: { $in: prodClusterLicencePlates },
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
  const prodClusterLicencePlates = await getProdClusterLicencePlates();
  const res = await Promise.all([
    getAggByCluster(prodClusterLicencePlates),
    getAggByCluster(prodClusterLicencePlates, 'SILVER'),
    getAggByCluster(prodClusterLicencePlates, 'GOLD'),
    getAggByCluster(prodClusterLicencePlates, 'EMERALD'),
  ]);

  return res as unknown as { _id: string; value: number }[][];
}
