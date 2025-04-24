import { DecisionStatus, Prisma, RequestType } from '@prisma/client';
import _filter from 'lodash-es/filter';
import _last from 'lodash-es/last';
import _orderBy from 'lodash-es/orderBy';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
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

export async function getUnitsPrices(endDate: Date) {
  const unitPrices = await prisma.privateCloudUnitPrice.findMany({
    where: {
      createdAt: { lte: endDate },
    },
    orderBy: { date: Prisma.SortOrder.desc },
  });
  return unitPrices;
}

export async function getCostItemsForRange(licencePlate: string, startDate: Date, endDate: Date): Promise<CostItem[]> {
  const [unitPrices, allRequests] = await Promise.all([
    getUnitsPrices(endDate),
    prisma.privateCloudRequest.findMany({
      where: {
        licencePlate,
        decisionStatus: { in: [DecisionStatus.PROVISIONED] },
        provisionedDate: { not: null, lte: endDate },
        OR: [{ type: RequestType.CREATE }, { isQuotaChanged: true }],
      },
      include: { decisionData: true },
      orderBy: { provisionedDate: 'asc' },
    }),
  ]);

  const changePoints = new Set<number>();

  for (const price of unitPrices) {
    changePoints.add(new Date(price.date).getTime());
  }

  for (const req of allRequests) {
    if (req.provisionedDate) changePoints.add(new Date(req.provisionedDate).getTime());
  }

  changePoints.add(startDate.getTime());
  changePoints.add(endDate.getTime());

  const sortedPoints = _orderBy(Array.from(changePoints), undefined, 'asc').map((ms) => new Date(ms));

  const costItems: CostItem[] = [];

  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const intervalStart = sortedPoints[i];
    const intervalEnd = sortedPoints[i + 1];

    if (intervalEnd <= startDate || intervalStart >= endDate) continue;

    const quota = _last(
      _filter(
        allRequests,
        (
          req,
        ): req is (typeof allRequests)[number] & {
          decisionData: { resourceRequests: Record<string, { cpu: number; storage: number }> };
        } => !!req.provisionedDate && req.provisionedDate <= intervalStart,
      ),
    );

    const price = _last(_filter(unitPrices, (p) => new Date(p.date) <= intervalStart)) ?? {
      id: 'fallback-zero',
      cpu: 0,
      storage: 0,
      date: intervalStart,
    };

    if (!quota || !price) continue;

    let totalCpu = 0;
    let totalStorage = 0;

    if (!quota) continue;
    const envs = quota.decisionData.resourceRequests;
    for (const env of namespaceKeys) {
      const usage = envs[env];
      if (usage) {
        totalCpu += usage.cpu || 0;
        totalStorage += usage.storage || 0;
      }
    }

    const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
    const durationFraction = durationMinutes / (1000 * 60 * 60 * 24);
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

  return costItems;
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
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const now = new Date();
  const isCurrentMonth = now.getUTCFullYear() === year && now.getUTCMonth() === month - 1;

  const costItems = await getCostItemsForRange(licencePlate, startDate, endDate);

  let currentTotal: number | undefined = undefined;
  let estimatedGrandTotal: number | undefined = undefined;
  let grandTotal: number | undefined = undefined;

  if (isCurrentMonth) {
    currentTotal = costItems.reduce((sum, i) => sum + i.totalCost, 0);
    const lastItem = costItems.at(-1);
    estimatedGrandTotal = estimateMonthTotal(currentTotal, year, month - 1, lastItem);
  } else {
    grandTotal = costItems.reduce((sum, i) => sum + i.totalCost, 0);
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
  };
}

export async function getYearlyCosts(licencePlate: string, year: string) {
  const numericYear = parseInt(year, 10);

  const yearlyCostsByMonth = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const startDate = new Date(numericYear, i, 1);
      const endDate = new Date(numericYear, i + 1, 0, 23, 59, 59, 999);

      const monthlyItems = await getCostItemsForRange(licencePlate, startDate, endDate);

      const cpuCost = monthlyItems.reduce((sum, req) => sum + req.cpuCost, 0);
      const storageCost = monthlyItems.reduce((sum, req) => sum + req.storageCost, 0);
      const totalCost = cpuCost + storageCost;

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
