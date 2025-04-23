import { DecisionStatus } from '@prisma/client';
import prisma from '@/core/prisma';

export interface CostItem {
  startDate: Date;
  endDate: Date;
  cpu: number;
  storage: number;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

export async function getLatestUnitPrice() {
  const unitPrice = await prisma.privateCloudUnitPrice.findFirst({
    orderBy: { date: 'desc' },
  });
  if (!unitPrice) throw new Error('Unit prices not found');
  return unitPrice;
}

export async function getCostItemsForRange(licencePlate: string, startDate: Date, endDate: Date): Promise<CostItem[]> {
  const unitPrice = await getLatestUnitPrice();

  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate,
      isQuotaChanged: true,
      decisionStatus: { in: [DecisionStatus.PROVISIONED] },
      updatedAt: { gte: startDate, lt: endDate },
    },
    include: { decisionData: true },
  });

  return requests.map((r) => {
    const cpu = r.decisionData.resourceRequests.development.cpu;
    const storage = r.decisionData.resourceRequests.development.storage;
    const cpuCost = cpu * unitPrice.cpu;
    const storageCost = storage * unitPrice.storage;
    const totalCost = cpuCost + storageCost;

    return {
      startDate: r.createdAt,
      endDate: r.updatedAt,
      cpu,
      storage,
      cpuCost,
      storageCost,
      totalCost,
    };
  });
}

export function estimateMonthTotal(currentTotal: number, year: number, month: number, lastItem?: CostItem): number {
  if (!lastItem) return currentTotal;
  const today = new Date().getUTCDate();
  const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
  const remaining = Math.max(daysInMonth - today, 0);
  const dailyCost = lastItem.totalCost / today;
  return currentTotal + dailyCost * remaining;
}

export async function readMonthlyCosts(licencePlate: string, yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const items = await getCostItemsForRange(licencePlate, startDate, endDate);
  const currentTotal = items.reduce((sum, i) => sum + i.totalCost, 0);
  const lastItem = items.at(-1);
  const estimatedGrandTotal = estimateMonthTotal(currentTotal, year, month - 1, lastItem);

  return {
    accountCoding: '123ABC', // temporary placeholder
    billingPeriod: `${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getFullYear()}`,
    currentTotal,
    grandTotal: undefined,
    estimatedGrandTotal,
    items,
  };
}

export async function readYearlyCosts(licencePlate: string, year: string) {
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
