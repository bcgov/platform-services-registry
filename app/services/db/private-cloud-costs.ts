import _cloneDeep from 'lodash-es/cloneDeep';
import _find from 'lodash-es/find';
import _orderBy from 'lodash-es/orderBy';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
import { DecisionStatus, Prisma, RequestType } from '@/prisma/client';
import { dateToShortDateString, getMinutesInYear, getDateFromYyyyMmDd, getMonthStartEndDate } from '@/utils/js/date';

interface EnvironmentDetails {
  cpu: {
    value: number;
    cost: number;
  };
  storage: {
    value: number;
    cost: number;
  };
  subtotal: {
    cost: number;
  };
}

interface CostItem {
  startDate: Date;
  endDate: Date;
  isPast: boolean;
  unitPriceId?: string;
  development: EnvironmentDetails;
  test: EnvironmentDetails;
  production: EnvironmentDetails;
  tools: EnvironmentDetails;
  total: EnvironmentDetails;
}

const roundToTwoDecimals = (value: number) => Number(value.toFixed(2));

function formatDecimals<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(formatDecimals) as unknown as T;
  } else if (obj instanceof Date) {
    return obj;
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = formatDecimals(value);
    }
    return result;
  } else if (typeof obj === 'number' && !Number.isInteger(obj)) {
    return roundToTwoDecimals(obj) as unknown as T;
  }
  return obj;
}

function getDetaultRangeCost() {
  return _cloneDeep({
    costToDate: 0,
    costToProjected: 0,
    costToTotal: 0,
  });
}

function getDetaultEnvironmentDetails() {
  return _cloneDeep({
    cpu: {
      value: 0,
      cost: 0,
    },
    storage: {
      value: 0,
      cost: 0,
    },
    subtotal: {
      cost: 0,
    },
  });
}

async function getCostDetailsForRange(licencePlate: string, startDate: Date, endDate: Date) {
  const [unitPrices, allRequests] = await Promise.all([
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
  ]);

  const today = new Date();
  const isTodayWithinRange = startDate <= today && today <= endDate;

  const changePoints = new Set<Date>();

  changePoints.add(startDate);
  changePoints.add(endDate);
  if (isTodayWithinRange) changePoints.add(today);

  for (const price of unitPrices) {
    changePoints.add(getDateFromYyyyMmDd(price.date));
  }

  for (const req of allRequests) {
    if (req.provisionedDate) changePoints.add(new Date(req.provisionedDate));
  }

  const sortedChangePoints = _orderBy(Array.from(changePoints), [], 'asc');
  const costItems: CostItem[] = [];

  const cpu = getDetaultRangeCost();
  const storage = getDetaultRangeCost();
  const total = getDetaultRangeCost();

  for (let changePoint = 0; changePoint < sortedChangePoints.length - 1; changePoint++) {
    const intervalStart = sortedChangePoints[changePoint];
    const intervalEnd = sortedChangePoints[changePoint + 1];

    if (intervalEnd <= startDate || intervalStart >= endDate) continue;

    const quota = _find(allRequests, (req) => !!req.provisionedDate && req.provisionedDate <= intervalStart);
    if (!quota) continue;

    const price = _find(unitPrices, (unitPrice) => getDateFromYyyyMmDd(unitPrice.date) <= intervalStart) ?? {
      id: 'fallback-zero',
      cpu: 0,
      storage: 0,
      date: intervalStart,
    };

    const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
    const minutesInYear = getMinutesInYear(startDate.getFullYear()); // TODO: handle multiple years
    const cpuPricePerMinute = price.cpu / minutesInYear;
    const storagePricePerMinute = price.storage / minutesInYear;
    const isPast = isTodayWithinRange && intervalEnd <= today;

    const environments = {
      development: getDetaultEnvironmentDetails(),
      test: getDetaultEnvironmentDetails(),
      production: getDetaultEnvironmentDetails(),
      tools: getDetaultEnvironmentDetails(),
      total: getDetaultEnvironmentDetails(),
    };

    const envs = quota.decisionData.resourceRequests;
    for (const env of namespaceKeys) {
      const usage = envs[env];
      if (usage) {
        environments[env].cpu.value = usage.cpu || 0;
        environments[env].storage.value = usage.storage || 0;

        environments[env].cpu.cost = environments[env].cpu.value * cpuPricePerMinute * durationMinutes;
        environments[env].storage.cost = environments[env].storage.value * storagePricePerMinute * durationMinutes;
        environments[env].subtotal.cost = environments[env].cpu.cost + environments[env].storage.cost;

        environments.total.cpu.value += environments[env].cpu.value;
        environments.total.storage.value += environments[env].storage.value;
        environments.total.cpu.cost += environments[env].cpu.cost;
        environments.total.storage.cost += environments[env].storage.cost;
        environments.total.subtotal.cost += environments[env].subtotal.cost;

        // Root level summary
        if (isPast) {
          cpu.costToDate += environments[env].cpu.cost;
          storage.costToDate += environments[env].storage.cost;
          total.costToDate += environments[env].subtotal.cost;
        } else {
          cpu.costToProjected += environments[env].cpu.cost;
          storage.costToProjected += environments[env].storage.cost;
          total.costToProjected += environments[env].subtotal.cost;
        }

        cpu.costToTotal += environments[env].cpu.cost;
        storage.costToTotal += environments[env].storage.cost;
        total.costToTotal += environments[env].subtotal.cost;
      }
    }

    costItems.push({
      startDate: intervalStart,
      endDate: intervalEnd,
      isPast,
      unitPriceId: price.id,
      ...environments,
    });
  }

  return formatDecimals({
    items: costItems,
    cpu,
    storage,
    total,
  });
}

export async function getMonthlyCosts(licencePlate: string, year: number, oneIndexedMonth: number) {
  const { startDate, endDate } = getMonthStartEndDate(year, oneIndexedMonth);
  const now = new Date();

  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === oneIndexedMonth - 1;
  const { items, total } = await getCostDetailsForRange(licencePlate, startDate, endDate);

  let currentTotal = -1;
  let estimatedGrandTotal = -1;
  let grandTotal = -1;

  if (isCurrentMonth) {
    currentTotal = total.costToDate;
    estimatedGrandTotal = total.costToTotal;
  } else {
    grandTotal = total.costToTotal;
  }

  return {
    accountCoding: '123ABC', // placeholder
    billingPeriod: dateToShortDateString(startDate),
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items: items.map((item) => {
      return {
        startDate: item.startDate,
        endDate: item.endDate,
        cpu: item.total.cpu.value,
        storage: item.total.storage.value,
        cpuCost: item.total.cpu.cost,
        storageCost: item.total.storage.cost,
        totalCost: item.total.subtotal.cost,
      };
    }),
  };
}

export async function getYearlyCosts(licencePlate: string, yearString: string) {
  const year = parseInt(yearString, 10);

  const items = await Promise.all(
    Array.from({ length: 12 }, async (_, zeroIndexedMonth) => {
      const { startDate, endDate } = getMonthStartEndDate(year, zeroIndexedMonth + 1);
      const { cpu, storage, total } = await getCostDetailsForRange(licencePlate, startDate, endDate);

      return {
        year,
        month: zeroIndexedMonth,
        cpuCost: cpu.costToDate,
        storageCost: storage.costToDate,
        totalCost: total.costToDate,
      };
    }),
  );

  return { items };
}

export async function getAdminMonthlyCosts(year: number, oneIndexedMonth: number) {
  const products = await prisma.privateCloudProduct.findMany({
    select: {
      name: true,
      licencePlate: true,
    },
  });

  const items = await Promise.all(
    products.map(async (product) => {
      const { currentTotal, grandTotal } = await getMonthlyCosts(product.licencePlate, year, oneIndexedMonth);
      const cost = grandTotal > -1 ? grandTotal : currentTotal;

      return {
        product,
        cost,
      };
    }),
  );

  return {
    year,
    month: oneIndexedMonth - 1,
    items,
  };
}
