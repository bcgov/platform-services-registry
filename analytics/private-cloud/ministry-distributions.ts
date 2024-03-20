import { Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { getProdClusterLicensePlates } from './common';

function getAggByCluster(prodClusterLicensePlates: string[], cluster?: string) {
  const pipeline: Prisma.InputJsonValue[] = cluster
    ? [
        {
          $match: {
            licencePlate: { $in: prodClusterLicensePlates },
            status: { $eq: 'ACTIVE' },
            cluster: { $regex: cluster, $options: 'i' },
          },
        },
      ]
    : [
        {
          $match: {
            licencePlate: { $in: prodClusterLicensePlates },
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
  const prodClusterLicensePlates = await getProdClusterLicensePlates();
  const res = await Promise.all([
    getAggByCluster(prodClusterLicensePlates),
    getAggByCluster(prodClusterLicensePlates, 'SILVER'),
    getAggByCluster(prodClusterLicensePlates, 'GOLD'),
    getAggByCluster(prodClusterLicensePlates, 'EMERALD'),
  ]);

  return res as unknown as { _id: string; value: number }[][];
}
