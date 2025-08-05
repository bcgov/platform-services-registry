import _cloneDeep from 'lodash-es/cloneDeep';
import _find from 'lodash-es/find';
import _findIndex from 'lodash-es/findIndex';
import _orderBy from 'lodash-es/orderBy';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
import { Cluster, DecisionStatus, Prisma, RequestType } from '@/prisma/client';
import { PeriodCostItem } from '@/types/private-cloud';
import {
  getMinutesInYear,
  getDateFromYyyyMmDd,
  getMonthStartEndDate,
  getQuarterStartEndDate,
  getYearlyStartEndDate,
  getMonthsArrayFromDates,
  dateRangeFormatter,
  getMinutesInMonth,
} from '@/utils/js/date';

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

function getProgress(startDate: Date, endDate: Date, today = new Date()): number {
  const total = endDate.getTime() - startDate.getTime();
  const completed = today.getTime() - startDate.getTime();

  if (total <= 0) return 0; // Invalid range
  if (today <= startDate) return 0;
  if (today >= endDate) return 1;

  return Math.max(0, Math.min(1, completed / total));
}

function getDefaultRangeCost() {
  return _cloneDeep({
    costsToDate: 0,
    costsToProjected: 0,
    costToTotal: 0,
  });
}

function getDefaultEnvironmentDetails() {
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
  const [unitPrices, allRequests, product] = await Promise.all([
    prisma.privateCloudUnitPrice.findMany({
      where: {},
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
    prisma.privateCloudProduct.findUnique({
      where: { licencePlate },
      select: { archivedAt: true },
    }),
  ]);

  const costItems: PeriodCostItem[] = [];
  const cpu = getDefaultRangeCost();
  const storage = getDefaultRangeCost();
  const total = getDefaultRangeCost();

  if (!product) {
    return {
      items: costItems,
      cpu,
      storage,
      total,
    };
  }

  const today = new Date();
  const isTodayWithinRange = startDate <= today && today <= endDate;
  const { archivedAt } = product;

  const changePoints = new Set<Date>();

  changePoints.add(startDate);
  changePoints.add(endDate);

  if (isTodayWithinRange) changePoints.add(today);
  if (archivedAt && startDate <= archivedAt && archivedAt <= endDate) {
    changePoints.add(archivedAt);
  }

  for (const price of unitPrices) {
    changePoints.add(getDateFromYyyyMmDd(price.date));
  }

  for (const req of allRequests) {
    if (req.provisionedDate) changePoints.add(new Date(req.provisionedDate));
  }

  const sortedChangePoints = _orderBy(Array.from(changePoints), [], 'asc');

  for (let changePoint = 0; changePoint < sortedChangePoints.length - 1; changePoint++) {
    const intervalStart = sortedChangePoints[changePoint];
    const intervalEnd = sortedChangePoints[changePoint + 1];

    if (intervalEnd <= startDate || intervalStart > endDate) continue;

    const price = _find(unitPrices, (unitPrice) => getDateFromYyyyMmDd(unitPrice.date) <= intervalStart) ?? {
      id: 'fallback-zero',
      cpu: 0,
      storage: 0,
      date: intervalStart,
    };

    const isArchived = !!(archivedAt && archivedAt <= intervalStart);
    const isPast = intervalEnd <= today;
    const isProjected = !isPast;

    const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
    const minutesInYear = getMinutesInYear(startDate.getFullYear()); // TODO: handle multiple years
    const cpuPricePerMinute = isArchived ? 0 : price.cpu / minutesInYear;
    const storagePricePerMinute = isArchived ? 0 : price.storage / minutesInYear;

    const environments = {
      development: getDefaultEnvironmentDetails(),
      test: getDefaultEnvironmentDetails(),
      production: getDefaultEnvironmentDetails(),
      tools: getDefaultEnvironmentDetails(),
      total: getDefaultEnvironmentDetails(),
    };

    const quota = _find(allRequests, (req) => !!req.provisionedDate && req.provisionedDate <= intervalStart);

    if (quota && !isArchived) {
      const envs = quota.decisionData.resourceRequests;

      for (const env of namespaceKeys) {
        const usage = envs[env];
        if (usage) {
          const isGoldDrEnabled = quota.decisionData.cluster === Cluster.GOLD && quota.decisionData.golddrEnabled;
          const resourceMultiplier = isGoldDrEnabled ? 2 : 1;

          environments[env].cpu.value = usage.cpu * resourceMultiplier || 0;
          environments[env].storage.value = usage.storage * resourceMultiplier || 0;

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
            cpu.costsToDate += environments[env].cpu.cost;
            storage.costsToDate += environments[env].storage.cost;
            total.costsToDate += environments[env].subtotal.cost;
          } else {
            cpu.costsToProjected += environments[env].cpu.cost;
            storage.costsToProjected += environments[env].storage.cost;
            total.costsToProjected += environments[env].subtotal.cost;
          }

          cpu.costToTotal += environments[env].cpu.cost;
          storage.costToTotal += environments[env].storage.cost;
          total.costToTotal += environments[env].subtotal.cost;
        }
      }
    }

    costItems.push({
      startDate: intervalStart,
      endDate: intervalEnd,
      minutes: durationMinutes,
      cpuPricePerMinute,
      cpuPricePerYear: price.cpu,
      storagePricePerMinute,
      storagePricePerYear: price.storage,
      isPast,
      isArchived,
      isProjected,
      unitPriceId: price.id,
      ...environments,
    });
  }

  return {
    items: costItems,
    cpu,
    storage,
    total,
  };
}

export async function getMonthlyCosts(licencePlate: string, year: number, oneIndexedMonth: number) {
  const { startDate, endDate } = getMonthStartEndDate(year, oneIndexedMonth);
  const month = oneIndexedMonth - 1;
  const today = new Date();
  const todayDay = today.getDate();
  const minutesInDay = 24 * 60;

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const { items, total } = await getCostDetailsForRange(licencePlate, startDate, endDate);

  let currentTotal = -1;
  let estimatedGrandTotal = -1;
  let grandTotal = -1;

  if (isCurrentMonth) {
    currentTotal = total.costsToDate;
    estimatedGrandTotal = total.costToTotal;
  } else {
    grandTotal = total.costToTotal;
  }

  const numDays = new Date(year, month + 1, 0).getDate();
  const days: number[] = Array.from({ length: numDays }, (_, i) => i + 1);

  const createNewBucket = () => new Array(numDays).fill(0);
  const cpuCostsToDate = createNewBucket();
  const cpuCostsToProjected = createNewBucket();
  const cpuCosts = createNewBucket();
  const storageCostsToDate = createNewBucket();
  const storageCostsToProjected = createNewBucket();
  const storageCosts = createNewBucket();
  const cpuQuotasToDate = createNewBucket();
  const cpuQuotasToProjected = createNewBucket();
  const cpuQuotas = createNewBucket();
  const storageQuotasToDate = createNewBucket();
  const storageQuotasToProjected = createNewBucket();
  const storageQuotas = createNewBucket();
  const costsToDate = createNewBucket();
  const costsToProjected = createNewBucket();
  const costs = createNewBucket();
  const pasts = new Array(numDays).fill(true);

  const sortedItems = _orderBy(items, ['startDate'], ['desc']);

  for (let day = 1; day <= numDays; day++) {
    const dayStart = new Date(year, month, day);
    const dayEnd = new Date(year, month, day + 1, 0, 0, 0, -1);

    const changePoints = new Set<Date>();

    changePoints.add(dayStart);
    changePoints.add(dayEnd);

    if (isCurrentMonth && day === todayDay) {
      changePoints.add(today);
    }

    sortedItems.forEach((item) => {
      if (dayStart < item.startDate && item.startDate < dayEnd) {
        changePoints.add(item.startDate);
      }
    });

    const sortedChangePoints = _orderBy(Array.from(changePoints), [], 'asc');

    for (let j = 0; j < sortedChangePoints.length - 1; j++) {
      let intervalStart = sortedChangePoints[j];
      const intervalEnd = sortedChangePoints[j + 1];

      const metaIndex = _findIndex(sortedItems, (item) => item.startDate <= intervalStart);
      if (metaIndex === -1) continue;

      const meta = sortedItems[metaIndex];
      // Ensure minutes are calculated correctly for the day the product created
      if (metaIndex === sortedItems.length - 1 && meta.startDate > intervalStart) intervalStart = meta.startDate;

      const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
      const durationRatio = durationMinutes / minutesInDay;
      const cpuCost = meta.total.cpu.value * meta.cpuPricePerMinute * durationMinutes;
      const storageCost = meta.total.storage.value * meta.storagePricePerMinute * durationMinutes;

      if (intervalEnd <= today) {
        cpuCostsToDate[day - 1] += cpuCost;
        storageCostsToDate[day - 1] += storageCost;
        cpuQuotasToDate[day - 1] += meta.total.cpu.value * durationRatio;
        storageQuotasToDate[day - 1] += meta.total.storage.value * durationRatio;
        costsToDate[day - 1] += cpuCost + storageCost;
      } else {
        cpuCostsToProjected[day - 1] += cpuCost;
        storageCostsToProjected[day - 1] += storageCost;
        cpuQuotasToProjected[day - 1] += meta.total.cpu.value * durationRatio;
        storageQuotasToProjected[day - 1] += meta.total.storage.value * durationRatio;
        costsToProjected[day - 1] += cpuCost + storageCost;
        pasts[day - 1] = false;
      }

      cpuCosts[day - 1] += cpuCost;
      storageCosts[day - 1] += storageCost;
      cpuQuotas[day - 1] += meta.total.cpu.value * durationRatio;
      storageQuotas[day - 1] += meta.total.storage.value * durationRatio;
      costs[day - 1] += cpuCost + storageCost;
    }
  }

  return {
    accountCoding: '123ABC', // placeholder
    billingPeriod: `${dateRangeFormatter.format(startDate)}—${dateRangeFormatter.format(endDate)}, ${year}`,
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items,
    startDate,
    progress: getProgress(startDate, endDate),
    timeUnits: days,
    timeDetails: {
      cpuCostsToDate,
      cpuCostsToProjected,
      cpuCosts,
      storageCostsToDate,
      storageCostsToProjected,
      storageCosts,
      cpuQuotasToDate,
      cpuQuotasToProjected,
      cpuQuotas,
      storageQuotasToDate,
      storageQuotasToProjected,
      storageQuotas,
      costsToDate,
      costsToProjected,
      costs,
      pasts,
    },
  };
}

async function getCostsBasedOnMonths(licencePlate: string, startDate: Date, endDate: Date) {
  const today = new Date();
  const year = startDate.getFullYear();
  const months = getMonthsArrayFromDates(startDate, endDate);
  const numberOfMonths = months.length;
  const isTodayInInterval = today >= startDate && today <= endDate;

  const { items, total } = await getCostDetailsForRange(licencePlate, startDate, endDate);

  let currentTotal = -1;
  let estimatedGrandTotal = -1;
  let grandTotal = -1;

  if (isTodayInInterval) {
    currentTotal = total.costsToDate;
    estimatedGrandTotal = total.costToTotal;
  } else {
    grandTotal = total.costToTotal;
  }

  const createNewBucket = () => new Array(numberOfMonths).fill(0);
  const cpuCostsToDate = createNewBucket();
  const cpuCostsToProjected = createNewBucket();
  const cpuCosts = createNewBucket();
  const storageCostsToDate = createNewBucket();
  const storageCostsToProjected = createNewBucket();
  const storageCosts = createNewBucket();
  const cpuQuotasToDate = createNewBucket();
  const cpuQuotasToProjected = createNewBucket();
  const cpuQuotas = createNewBucket();
  const storageQuotasToDate = createNewBucket();
  const storageQuotasToProjected = createNewBucket();
  const storageQuotas = createNewBucket();
  const costsToDate = createNewBucket();
  const costsToProjected = createNewBucket();
  const costs = createNewBucket();
  const pasts = new Array(numberOfMonths).fill(true);

  const sortedItems = _orderBy(items, ['startDate'], ['desc']);

  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const jsMonth = month - 1; // convert to 0-indexed
    const minutesInMonth = getMinutesInMonth(year, month);

    const monthStart = new Date(year, jsMonth, 1);
    const monthEnd = new Date(year, jsMonth + 1, 1, 0, 0, 0, -1);

    const changePoints = new Set<Date>();

    changePoints.add(monthStart);
    changePoints.add(monthEnd);

    if (today.getFullYear() === year && today.getMonth() === jsMonth) {
      changePoints.add(today);
    }

    sortedItems.forEach((item) => {
      if (monthStart < item.startDate && item.startDate < monthEnd) {
        changePoints.add(item.startDate);
      }
    });

    const sortedChangePoints = _orderBy(Array.from(changePoints), [], 'asc');

    for (let j = 0; j < sortedChangePoints.length - 1; j++) {
      let intervalStart = sortedChangePoints[j];
      const intervalEnd = sortedChangePoints[j + 1];

      const metaIndex = _findIndex(sortedItems, (item) => item.startDate <= intervalStart);
      if (metaIndex === -1) continue;

      const meta = sortedItems[metaIndex];
      // Ensure minutes are calculated correctly for the day the product created
      if (metaIndex === sortedItems.length - 1 && meta.startDate > intervalStart) intervalStart = meta.startDate;

      const durationMinutes = (intervalEnd.getTime() - intervalStart.getTime()) / (1000 * 60);
      const durationRatio = durationMinutes / minutesInMonth;
      const cpuCost = meta.total.cpu.value * meta.cpuPricePerMinute * durationMinutes;
      const storageCost = meta.total.storage.value * meta.storagePricePerMinute * durationMinutes;

      if (intervalEnd <= today) {
        cpuCostsToDate[i] += cpuCost;
        storageCostsToDate[i] += storageCost;
        cpuQuotasToDate[i] += meta.total.cpu.value * durationRatio;
        storageQuotasToDate[i] += meta.total.storage.value * durationRatio;
        costsToDate[i] += cpuCost + storageCost;
      } else {
        cpuCostsToProjected[i] += cpuCost;
        storageCostsToProjected[i] += storageCost;
        cpuQuotasToProjected[i] += meta.total.cpu.value * durationRatio;
        storageQuotasToProjected[i] += meta.total.storage.value * durationRatio;
        costsToProjected[i] += cpuCost + storageCost;
        pasts[i] = false;
      }

      cpuCosts[i] += cpuCost;
      storageCosts[i] += storageCost;
      cpuQuotas[i] += meta.total.cpu.value * durationRatio;
      storageQuotas[i] += meta.total.storage.value * durationRatio;
      costs[i] += cpuCost + storageCost;
    }
  }

  return {
    accountCoding: '123ABC', // placeholder
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items,
    startDate,
    progress: getProgress(startDate, endDate),
    timeUnits: months,
    timeDetails: {
      cpuCostsToDate,
      cpuCostsToProjected,
      cpuCosts,
      storageCostsToDate,
      storageCostsToProjected,
      storageCosts,
      cpuQuotasToDate,
      cpuQuotasToProjected,
      cpuQuotas,
      storageQuotasToDate,
      storageQuotasToProjected,
      storageQuotas,
      costsToDate,
      costsToProjected,
      costs,
      pasts,
    },
  };
}

export async function getQuarterlyCosts(licencePlate: string, year: number, quarter: number) {
  const { startDate, endDate } = getQuarterStartEndDate(year, quarter);
  const baseData = await getCostsBasedOnMonths(licencePlate, startDate, endDate);

  const result = {
    ...baseData,
    billingPeriod: `${dateRangeFormatter.format(startDate)}—${dateRangeFormatter.format(endDate)}, ${year}`,
  };

  return result;
}

export async function getYearlyCosts(licencePlate: string, yearString: string) {
  const year = parseInt(yearString, 10);
  const { startDate, endDate } = getYearlyStartEndDate(year);
  const baseData = await getCostsBasedOnMonths(licencePlate, startDate, endDate);

  const result = {
    ...baseData,
    billingPeriod: `${dateRangeFormatter.format(startDate)}—${dateRangeFormatter.format(endDate)}, ${year}`,
  };

  return result;
}

export async function getAdminMonthlyCosts(year: number, oneIndexedMonth: number) {
  const products = await prisma.privateCloudProduct.findMany({
    select: {
      name: true,
      licencePlate: true,
    },
  });

  let totalCost = 0;
  const items = await Promise.all(
    products.map(async (product) => {
      const { currentTotal, grandTotal } = await getMonthlyCosts(product.licencePlate, year, oneIndexedMonth);
      const cost = grandTotal > -1 ? grandTotal : currentTotal;
      totalCost += cost;

      return {
        product,
        cost,
      };
    }),
  );

  return {
    year,
    month: oneIndexedMonth - 1,
    totalCount: products.length,
    totalCost,
    items,
  };
}
