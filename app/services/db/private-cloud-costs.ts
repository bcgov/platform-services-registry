import { DecisionStatus, Prisma, RequestType, PrivateCloudUnitPrice } from '@prisma/client';
import _filter from 'lodash-es/filter';
import _find from 'lodash-es/find';
import _orderBy from 'lodash-es/orderBy';
import _reduce from 'lodash-es/reduce';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
import { PrivateCloudRequestWithDecisionData } from '@/types/private-cloud';
import { dateToShortDateString, getMinutesInYear, getNowInPacificTime } from '@/utils/js/date';

export interface CostItem {
  startDate: Date;
  endDate: Date;
  cpu: number;
  storage: number;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
  unitPriceId?: string;
}

function getMonthStartEndDate(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1, 0, 0, 0, -1);
  return {
    startDate,
    endDate,
  };
}

export async function getCostItemsForRange(
  licencePlate: string,
  startDate: Date,
  endDate: Date,
): Promise<{
  items: CostItem[];
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}> {
  const [unitPrices, allRequests]: [PrivateCloudUnitPrice[], PrivateCloudRequestWithDecisionData[]] = await Promise.all(
    [
      prisma.privateCloudUnitPrice.findMany({
        where: {
          createdAt: { lte: endDate },
        },
        orderBy: { date: Prisma.SortOrder.desc },
      }),
      prisma.privateCloudRequest.findMany({
        where: {
          licencePlate,
          decisionStatus: { in: [DecisionStatus.PROVISIONED] },
          provisionedDate: { not: null, lte: endDate },
          OR: [{ type: RequestType.CREATE }, { isQuotaChanged: true }],
        },
        include: { decisionData: true },
        orderBy: { provisionedDate: Prisma.SortOrder.desc },
      }),
    ],
  );

  const changePoints = new Set<number>();

  for (const price of unitPrices) {
    changePoints.add(new Date(price.date).getTime());
  }

  for (const req of allRequests) {
    if (req.provisionedDate) changePoints.add(new Date(req.provisionedDate).getTime());
  }

  changePoints.add(startDate.getTime());
  changePoints.add(getNowInPacificTime().getTime());
  changePoints.add(endDate.getTime());

  const sortedChangePoints = _orderBy(Array.from(changePoints), [], 'asc').map((ms) => new Date(ms));
  const costItems: CostItem[] = [];

  for (let changePoint = 0; changePoint < sortedChangePoints.length - 1; changePoint++) {
    const intervalStart = sortedChangePoints[changePoint];
    const intervalEnd = sortedChangePoints[changePoint + 1];

    if (intervalEnd <= startDate || intervalStart >= endDate) continue;

    const quota = _find(allRequests, (req) => !!req.provisionedDate && req.provisionedDate <= intervalStart);
    if (!quota) continue;

    const price = _find(unitPrices, (unitPrice) => new Date(unitPrice.date) <= intervalStart) ?? {
      id: 'fallback-zero',
      cpu: 0,
      storage: 0,
      date: intervalStart,
    };

    let totalCpu = 0;
    let totalStorage = 0;

    const envs = quota.decisionData.resourceRequests;

    for (const env of namespaceKeys) {
      const usage = envs[env];
      if (usage) {
        totalCpu += usage.cpu || 0;
        totalStorage += usage.storage || 0;
      }
    }

    // Duration in minutes for this interval
    const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
    const minutesInYear = getMinutesInYear(startDate.getFullYear());
    const cpuCost = totalCpu * (price.cpu / minutesInYear) * durationMinutes;
    const storageCost = totalStorage * (price.storage / minutesInYear) * durationMinutes;

    const totalCost = cpuCost + storageCost;

    costItems.push({
      startDate: intervalStart,
      endDate: intervalEnd,
      cpu: totalCpu,
      storage: totalStorage,
      cpuCost,
      storageCost,
      totalCost,
      unitPriceId: price.id,
    });
  }

  const cpuCost = _reduce(costItems, (sum, item) => sum + item.cpuCost, 0);
  const storageCost = _reduce(costItems, (sum, item) => sum + item.storageCost, 0);
  const totalCost = cpuCost + storageCost;

  return {
    items: costItems,
    cpuCost,
    storageCost,
    totalCost,
  };
}

export async function getMonthlyCosts(licencePlate: string, year: number, month: number) {
  const { startDate, endDate } = getMonthStartEndDate(year, month);
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month - 1;

  const {
    items: costItems,
    cpuCost,
    storageCost,
    totalCost,
  } = await getCostItemsForRange(licencePlate, startDate, endDate);

  let currentTotal = -1;
  let estimatedGrandTotal = -1;
  let grandTotal = -1;

  if (isCurrentMonth) {
    estimatedGrandTotal = totalCost;

    const pastItems = _filter(costItems, (item) => item.endDate <= now);
    currentTotal = _reduce(pastItems, (sum, item) => sum + item.totalCost, 0);
  } else {
    grandTotal = totalCost;
  }

  return {
    accountCoding: '123ABC', // placeholder
    billingPeriod: dateToShortDateString(startDate),
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items: costItems,
    cpuCost,
    storageCost,
  };
}

export async function getYearlyCosts(licencePlate: string, yearString: string) {
  const year = parseInt(yearString, 10);

  const yearlyCostsByMonth = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const { startDate, endDate } = getMonthStartEndDate(year, month);
      const { cpuCost, storageCost, totalCost } = await getCostItemsForRange(licencePlate, startDate, endDate);

      return {
        year,
        month,
        cpuCost,
        storageCost,
        totalCost,
      };
    }),
  );

  return { yearlyCostsByMonth };
}

export async function getAdminMonthlyCosts(year: number, month: number) {
  const products = await prisma.privateCloudProduct.findMany({
    select: {
      name: true,
      licencePlate: true,
    },
  });

  const items = await Promise.all(
    products.map(async (product) => {
      const monthly = await getMonthlyCosts(product.licencePlate, year, month);
      const cost = monthly.grandTotal > -1 ? monthly.grandTotal : monthly.currentTotal ?? 0;

      return {
        product,
        cost,
      };
    }),
  );

  return {
    year,
    month,
    items,
  };
}
