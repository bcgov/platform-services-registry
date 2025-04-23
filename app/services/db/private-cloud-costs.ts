import { DecisionStatus } from '@prisma/client';
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

export async function getUnitsPrice() {
  const unitPrice = await prisma.privateCloudUnitPrice.findMany({
    orderBy: { date: 'desc' },
  });
  return unitPrice;
}

export async function getCostItemsForRange(licencePlate: string, startDate: Date, endDate: Date) {
  const unitPrices = await getUnitsPrice();

  const allRequests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate,
      isQuotaChanged: true,
      decisionStatus: { in: [DecisionStatus.PROVISIONED] },
      provisionedDate: { not: null, lte: endDate },
    },
    include: { decisionData: true },
    orderBy: { provisionedDate: 'asc' },
  });

  const requestsInRange = allRequests.filter(
    (req) => req.provisionedDate! >= startDate && req.provisionedDate! <= endDate,
  );

  if (requestsInRange.length === 1) {
    const fallback = [...allRequests].reverse().find((req) => req.provisionedDate! < startDate);
    if (fallback) return [fallback, ...requestsInRange] as unknown as CostItem[];
  }

  const costItems: CostItem[] = [];

  for (const r of requestsInRange) {
    const provisionedDate = r.provisionedDate!;
    let applicablePrice = [...unitPrices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find((price) => new Date(price.date) <= provisionedDate);

    if (!applicablePrice) {
      applicablePrice = unitPrices[unitPrices.length - 1];
    }

    const envs = r.decisionData.resourceRequests;

    let totalCpu = 0;
    let totalStorage = 0;

    for (const env of namespaceKeys) {
      const usage = envs[env];
      if (usage) {
        totalCpu += usage.cpu || 0;
        totalStorage += usage.storage || 0;
      }
    }

    const cpuCost = totalCpu * applicablePrice.cpu;
    const storageCost = totalStorage * applicablePrice.storage;
    const totalCost = cpuCost + storageCost;

    costItems.push({
      startDate: r.createdAt,
      endDate: r.updatedAt,
      cpu: totalCpu,
      storage: totalStorage,
      cpuCost,
      storageCost,
      totalCost,
      unitPriceId: applicablePrice.id,
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

  const isPastMonth = now.getUTCFullYear() > year || (now.getUTCFullYear() === year && now.getUTCMonth() > month - 1);

  const costItems = await getCostItemsForRange(licencePlate, startDate, endDate);

  let currentTotal: number | undefined = undefined;
  let estimatedGrandTotal: number | undefined = undefined;
  let grandTotal: number | undefined = undefined;

  if (isCurrentMonth) {
    currentTotal = costItems.reduce((sum, i) => sum + i.totalCost, 0);
    const lastItem = costItems.at(-1);
    estimatedGrandTotal = estimateMonthTotal(currentTotal, year, month - 1, lastItem);
  }

  if (isPastMonth) {
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
      const endDate = new Date(numericYear, i + 1, 1);
      const monthlyItems = await getCostItemsForRange(licencePlate, startDate, endDate);

      const cpuCost = monthlyItems.reduce((sum, r) => sum + r.cpuCost, 0);
      const storageCost = monthlyItems.reduce((sum, r) => sum + r.storageCost, 0);
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
