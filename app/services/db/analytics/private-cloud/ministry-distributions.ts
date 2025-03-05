import { Prisma } from '@prisma/client';
import { clusters } from '@/constants';
import prisma from '@/core/prisma';

function getAggByCluster(licencePlatesList: string[], cluster?: string, dateFilter?: Record<string, any>) {
  const matchStage: Record<string, any> = {
    licencePlate: { $in: licencePlatesList },
    status: 'ACTIVE',
  };

  if (dateFilter) {
    matchStage.createdAt = dateFilter.createdAt;
  }

  if (cluster) {
    matchStage.cluster = { $regex: `^${cluster}$`, $options: 'i' };
  }

  const pipeline: Prisma.InputJsonValue[] = [
    { $match: matchStage },
    {
      $group: {
        _id: '$ministry',
        value: { $count: {} },
      },
    },
  ];

  return prisma.privateCloudProject.aggregateRaw({ pipeline });
}

export async function getMinistryDistributions({
  licencePlatesList,
  dates = [],
}: {
  licencePlatesList: string[];
  dates: string[];
}) {
  const dateFilter =
    dates?.length === 2
      ? {
          createdAt: {
            $gte: { $date: new Date(dates[0]).toISOString() },
            $lte: { $date: new Date(dates[1]).toISOString() },
          },
        }
      : {};

  const result = await Promise.all([
    getAggByCluster(licencePlatesList, undefined, dateFilter),
    ...clusters.map((cluster) => getAggByCluster(licencePlatesList, cluster, dateFilter)),
  ]);

  return result;
}
