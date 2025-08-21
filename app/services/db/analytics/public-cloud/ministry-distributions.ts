import { providers } from '@/constants';
import prisma from '@/core/prisma';
import { Prisma } from '@/prisma/client';

function getAggByProvider(licencePlatesList: string[], provider?: string, dateFilter?: Record<string, any>) {
  const matchStage: Record<string, any> = {
    licencePlate: { $in: licencePlatesList },
    status: 'ACTIVE',
  };

  if (dateFilter) {
    matchStage.createdAt = dateFilter.createdAt;
  }

  if (provider) {
    matchStage.provider = { $regex: `^${provider}$`, $options: 'i' };
  }

  const pipeline: Prisma.InputJsonValue[] = [
    { $match: matchStage },
    {
      $group: {
        _id: '$organizationId',
        value: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'Organization',
        localField: '_id',
        foreignField: '_id',
        as: 'org',
      },
    },
    { $unwind: '$org' },
    {
      $project: {
        _id: 0,
        label: '$org.name',
        value: 1,
      },
    },
  ];

  return prisma.publicCloudProduct.aggregateRaw({ pipeline });
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
    getAggByProvider(licencePlatesList, undefined, dateFilter),
    ...providers.map((provider) => getAggByProvider(licencePlatesList, provider, dateFilter)),
  ]);

  return result;
}
