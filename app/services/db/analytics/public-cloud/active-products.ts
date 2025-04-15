import { Provider, RequestType, DecisionStatus } from '@prisma/client';
import _uniq from 'lodash-es/uniq';
import { providers } from '@/constants';
import prisma from '@/core/prisma';
import { dateToShortDateString, shortDateStringToDate } from '@/utils/js';

async function productsCreatedPerMonth(
  licencePlatesList: string[],
  providers: Provider[],
  dateFilter?: Record<string, any>,
) {
  const [products, deleteRequests] = await Promise.all([
    prisma.publicCloudProduct.findMany({
      where: {
        licencePlate: { in: licencePlatesList },
        provider: { in: providers },
        ...dateFilter,
      },
      select: {
        licencePlate: true,
        provider: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
    prisma.publicCloudRequest.findMany({
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
    ...Object.fromEntries(Object.values(Provider).map((provider) => [provider, 0])),
  } as { all: number } & Record<Provider, number>;

  const result: Record<string, { all: number } & Record<Provider, number>> = {};

  for (const dt of allDates) {
    const key = dateToShortDateString(dt);

    result[key] = { ...cumulativeCounts };

    const newProducts = products.filter((product) => dateToShortDateString(product.createdAt) === key);
    const deletedProducts = deleteRequests.filter((request) => dateToShortDateString(request.createdAt) === key);

    newProducts.forEach((product) => {
      cumulativeCounts.all++;
      cumulativeCounts[product.provider as Provider]++;
    });

    deletedProducts.forEach((request) => {
      const product = products.find((p) => p.licencePlate === request.licencePlate);
      if (product) {
        cumulativeCounts.all--;
        cumulativeCounts[product.provider as Provider]--;
      }
    });

    result[key] = { ...cumulativeCounts };
  }

  return result;
}

export async function getActiveProducts({
  licencePlatesList,
  dateFilter = {},
  providersOptions = providers,
}: {
  licencePlatesList: string[];
  dateFilter?: Record<string, any>;
  providersOptions?: Provider[];
}) {
  const result = await productsCreatedPerMonth(licencePlatesList, providersOptions, dateFilter);

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    'All Providers': counts.all,
    ...providersOptions.reduce(
      (acc, provider) => {
        acc[provider] = counts[provider] || 0;
        return acc;
      },
      {} as Record<Provider, number>,
    ),
  }));

  return data;
}
