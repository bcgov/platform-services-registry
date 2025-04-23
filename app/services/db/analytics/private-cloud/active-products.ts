import _uniq from 'lodash-es/uniq';
import { clusters } from '@/constants';
import prisma from '@/core/prisma';
import { Cluster, RequestType, DecisionStatus } from '@/prisma/client';
import { dateToShortDateString, shortDateStringToDate } from '@/utils/js';

async function productsCreatedPerMonth(
  licencePlatesList: string[],
  clusters: Cluster[],
  dateFilter?: Record<string, any>,
) {
  const [products, deleteRequests] = await Promise.all([
    prisma.privateCloudProduct.findMany({
      where: {
        licencePlate: { in: licencePlatesList },
        cluster: { in: clusters },
        isTest: false,
        ...dateFilter,
      },
      select: {
        licencePlate: true,
        cluster: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.privateCloudRequest.findMany({
      where: {
        type: RequestType.DELETE,
        decisionStatus: DecisionStatus.PROVISIONED,
        ...dateFilter,
      },
      select: {
        licencePlate: true,
        createdAt: true,
      },
    }),
  ]);

  const allShortDateStrs = _uniq(products.map((product) => dateToShortDateString(product.createdAt)));
  const allDates = allShortDateStrs.map(shortDateStringToDate).sort((a, b) => a.getTime() - b.getTime());

  const cumulativeCounts = {
    all: 0,
    ...Object.fromEntries(Object.values(Cluster).map((cluster) => [cluster, 0])),
  } as { all: number } & Record<Cluster, number>;

  const result: Record<string, { all: number } & Record<Cluster, number>> = {};

  for (const dt of allDates) {
    const key = dateToShortDateString(dt);

    result[key] = { ...cumulativeCounts };

    const newProducts = products.filter((product) => dateToShortDateString(product.createdAt) === key);
    const deletedProducts = deleteRequests.filter((request) => dateToShortDateString(request.createdAt) === key);

    newProducts.forEach((product) => {
      cumulativeCounts.all++;
      cumulativeCounts[product.cluster as Cluster]++;
    });

    deletedProducts.forEach((request) => {
      const product = products.find((p) => p.licencePlate === request.licencePlate);
      if (product) {
        cumulativeCounts.all--;
        cumulativeCounts[product.cluster as Cluster]--;
      }
    });

    result[key] = { ...cumulativeCounts };
  }

  return result;
}

export async function getActiveProducts({
  licencePlatesList,
  dateFilter = {},
  clustersOptions = clusters,
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
  clustersOptions?: Cluster[];
}) {
  const result = await productsCreatedPerMonth(licencePlatesList, clustersOptions, dateFilter);

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    'All Clusters': counts.all,
    ...clustersOptions.reduce(
      (acc, cluster) => {
        acc[cluster] = counts[cluster] || 0;
        return acc;
      },
      {} as Record<Cluster, number>,
    ),
  }));

  return data;
}
