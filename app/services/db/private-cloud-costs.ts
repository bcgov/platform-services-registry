import { DecisionStatus, Prisma, RequestType, PrivateCloudUnitPrice } from '@prisma/client';
import _filter from 'lodash-es/filter';
import _find from 'lodash-es/find';
import _orderBy from 'lodash-es/orderBy';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
import { PrivateCloudRequestWithDecisionData } from '@/types/private-cloud';

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
  changePoints.add(endDate.getTime());

  const sortedPoints = _orderBy(Array.from(changePoints), [], 'asc').map((ms) => new Date(ms));
  const costItems: CostItem[] = [];

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const intervalStart = sortedPoints[i];
    const intervalEnd = sortedPoints[i + 1];

    if (intervalEnd <= startDate || intervalStart >= endDate) continue;

    const quota = _find(
      _filter(
        allRequests,
        (req): req is PrivateCloudRequestWithDecisionData =>
          !!req.provisionedDate && req.provisionedDate <= intervalStart,
      ),
    );
    const price = _find(_filter(unitPrices, (p) => new Date(p.date) <= intervalStart)) ?? {
      id: 'fallback-zero',
      cpu: 0,
      storage: 0,
      date: intervalStart,
    };

    if (!quota) continue;

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

    const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
    // durationFraction = how many days (or portion of days) the interval covers
    const durationFraction = durationMinutes / (60 * 24);

    const cpuCost = totalCpu * price.cpu * durationFraction;
    const storageCost = totalStorage * price.storage * durationFraction;
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

  const cpuCost = costItems.reduce((sum, item) => sum + item.cpuCost, 0);
  const storageCost = costItems.reduce((sum, item) => sum + item.storageCost, 0);
  const totalCost = cpuCost + storageCost;

  return {
    items: costItems,
    cpuCost,
    storageCost,
    totalCost,
  };
}

export function estimateMonthTotal(currentTotal: number, year: number, month: number, lastItem?: CostItem) {
  if (!lastItem) return currentTotal;

  const lastDay = lastItem.endDate.getUTCDate();
  const daysInMonth = new Date(year, month + 1, 0).getUTCDate();

  const elapsedDays = Math.max(lastDay, 1);
  const remaining = daysInMonth - elapsedDays;

  const dailyCost = lastItem.totalCost / elapsedDays;
  return currentTotal + dailyCost * remaining;
}

export async function getMonthlyCosts(licencePlate: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const now = new Date();
  const isCurrentMonth = now.getUTCFullYear() === year && now.getUTCMonth() === month - 1;

  const {
    items: costItems,
    cpuCost,
    storageCost,
    totalCost: currentTotal,
  } = await getCostItemsForRange(licencePlate, startDate, endDate);

  let estimatedGrandTotal = -1;
  let grandTotal = -1;

  if (isCurrentMonth) {
    const lastItem = costItems.at(-1);
    estimatedGrandTotal = estimateMonthTotal(currentTotal, year, month - 1, lastItem);

    if (lastItem) {
      const lastDay = lastItem.endDate.getDate();
      const daysInMonth = new Date(year, month, 0).getDate();
      const elapsedDays = Math.max(lastDay, 1);
      const remaining = daysInMonth - elapsedDays;

      if (remaining > 0) {
        const dailyCost = lastItem.totalCost / elapsedDays;
        const estimatedRemainingCost = dailyCost * remaining;

        costItems.push({
          startDate: new Date(year, month - 1, lastDay + 1),
          endDate: new Date(year, month - 1, daysInMonth, 23, 59, 59, 999),
          cpu: lastItem.cpu,
          storage: lastItem.storage,
          cpuCost: lastItem.cpuCost * (remaining / elapsedDays),
          storageCost: lastItem.storageCost * (remaining / elapsedDays),
          totalCost: estimatedRemainingCost,
          unitPriceId: lastItem.unitPriceId,
        });
      }
    }
  } else {
    grandTotal = currentTotal;
  }

  return {
    accountCoding: '123ABC', // placeholder
    billingPeriod: `${new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(
      startDate,
    )} ${startDate.getUTCFullYear()}`,
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items: costItems,
    cpuCost,
    storageCost,
  };
}

export async function getYearlyCosts(licencePlate: string, year: string) {
  const numericYear = parseInt(year, 10);

  const yearlyCostsByMonth = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const startDate = new Date(numericYear, i, 1);
      const endDate = new Date(numericYear, i + 1, 0, 23, 59, 59, 999);

      const { cpuCost, storageCost, totalCost } = await getCostItemsForRange(licencePlate, startDate, endDate);

      return {
        year: numericYear,
        month: i,
        cpuCost,
        storageCost,
        totalCost,
      };
    }),
  );

  return { yearlyCostsByMonth };
}
