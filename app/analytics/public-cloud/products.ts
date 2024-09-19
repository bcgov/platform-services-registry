import { Provider, RequestType, DecisionStatus } from '@prisma/client';
import _forEach from 'lodash-es/forEach';
import _uniq from 'lodash-es/uniq';
import prisma from '@/core/prisma';
import { dateToShortDateString, shortDateStringToDate, compareYearMonth } from '@/utils/date';

export async function productsCreatedPerMonth() {
  const [projects, deleteRequests] = await Promise.all([
    prisma.publicCloudProject.findMany({
      where: {
        provider: { in: [Provider.AWS, Provider.AZURE] },
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
      },
      select: {
        licencePlate: true,
        createdAt: true,
      },
    }),
  ]);

  const result: {
    [key: string]: {
      all: number;
      [Provider.AWS]: number;
      [Provider.AZURE]: number;
    };
  } = {};

  const allShortDateStrs = _uniq(projects.map((proj) => dateToShortDateString(proj.createdAt)));
  const allDates = allShortDateStrs.map(shortDateStringToDate);

  _forEach(allDates, (dt, i) => {
    _forEach(projects, (proj) => {
      if (compareYearMonth(dt, proj.createdAt) < 0) return;
      const deleteRequest = deleteRequests.find((req) => req.licencePlate === proj.licencePlate);

      if (deleteRequest) {
        if (compareYearMonth(dt, deleteRequest.createdAt) === 1) {
          return;
        }
      }

      const key = allShortDateStrs[i];
      if (!result[key]) {
        result[key] = { all: 0, [Provider.AWS]: 0, [Provider.AZURE]: 0 };
      }

      result[key].all++;
      result[key][proj.provider]++;
    });
  });

  return result;
}

export async function numberOfProductsOverTime() {
  const result = await productsCreatedPerMonth();

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    AWS: counts[Provider.AWS],
    AZURE: counts[Provider.AZURE],
  }));

  return data;
}
