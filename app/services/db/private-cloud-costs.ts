import _cloneDeep from 'lodash-es/cloneDeep';
import _find from 'lodash-es/find';
import _findIndex from 'lodash-es/findIndex';
import _orderBy from 'lodash-es/orderBy';
import { namespaceKeys } from '@/constants';
import prisma from '@/core/prisma';
import { Cluster, DecisionStatus, Prisma, RequestType } from '@/prisma/client';
import {
  CostItem,
  DailyDiscreteValue,
  QuarterlyDiscreteValue,
  TimeView,
  YearlyDiscreteValue,
} from '@/types/private-cloud';
import {
  getMinutesInYear,
  getDateFromYyyyMmDd,
  getMonthStartEndDate,
  getQuarterStartEndDate,
  getYearlyStartEndDate,
  getMonthsArrayFromDates,
  getDaysBetweenDates,
  dateRangeFormatter,
} from '@/utils/js/date';
import { roundToHalfIncrement } from '@/utils/js/number';

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

function getDefaultRangeCost() {
  return _cloneDeep({
    costToDate: 0,
    costToProjected: 0,
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

  const costItems: CostItem[] = [];
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
    }

    costItems.push({
      startDate: intervalStart,
      endDate: intervalEnd,
      minutes: durationMinutes,
      cpuPricePerMinute,
      storagePricePerMinute,
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

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
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

  const numDays = new Date(year, month + 1, 0).getDate();
  const days: number[] = Array.from({ length: numDays }, (_, i) => i + 1);

  const cpuToDate = new Array(numDays).fill(0);
  const cpuToProjected = new Array(numDays).fill(0);
  const storageToDate = new Array(numDays).fill(0);
  const storageToProjected = new Array(numDays).fill(0);

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
      const cpuPrice = meta.total.cpu.value * meta.cpuPricePerMinute * durationMinutes;
      const storagePrice = meta.total.storage.value * meta.storagePricePerMinute * durationMinutes;

      if (intervalEnd <= today) {
        cpuToDate[day - 1] += cpuPrice;
        storageToDate[day - 1] += storagePrice;
      } else {
        cpuToProjected[day - 1] += cpuPrice;
        storageToProjected[day - 1] += storagePrice;
      }
    }
  }

  return {
    accountCoding: '123ABC', // placeholder
    billingPeriod: `${dateRangeFormatter.format(startDate)}—${dateRangeFormatter.format(endDate)}, ${year}`,
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items,
    discreteResourceValues: getDiscreteResourceValues(items, TimeView.Monthly) as DailyDiscreteValue[],
    startDate,
    numberOfDaysBetweenDates: getDaysBetweenDates(startDate, endDate),
    days,
    dayDetails: {
      cpuToDate,
      cpuToProjected,
      storageToDate,
      storageToProjected,
    },
  };
}

async function getCostsBasedOnMonths(timeView: TimeView, licencePlate: string, startDate: Date, endDate: Date) {
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
    currentTotal = total.costToDate;
    estimatedGrandTotal = total.costToTotal;
  } else {
    grandTotal = total.costToTotal;
  }

  const cpuToDate = new Array(numberOfMonths).fill(0);
  const cpuToProjected = new Array(numberOfMonths).fill(0);
  const storageToDate = new Array(numberOfMonths).fill(0);
  const storageToProjected = new Array(numberOfMonths).fill(0);

  const sortedItems = _orderBy(items, ['startDate'], ['desc']);

  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const jsMonth = month - 1; // convert to 0-indexed
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
      const cpuPrice = meta.total.cpu.value * meta.cpuPricePerMinute * durationMinutes;
      const storagePrice = meta.total.storage.value * meta.storagePricePerMinute * durationMinutes;

      if (intervalEnd <= today) {
        cpuToDate[i] += cpuPrice;
        storageToDate[i] += storagePrice;
      } else {
        cpuToProjected[i] += cpuPrice;
        storageToProjected[i] += storagePrice;
      }
    }
  }

  const discreteResourceValues: QuarterlyDiscreteValue | YearlyDiscreteValue = getDiscreteResourceValues(
    items,
    timeView,
  );

  return {
    accountCoding: '123ABC', // placeholder
    currentTotal,
    estimatedGrandTotal,
    grandTotal,
    items,
    discreteResourceValues,
    startDate,
    numberOfDaysBetweenDates: getDaysBetweenDates(startDate, endDate),
    months,
    monthDetails: {
      cpuToDate,
      cpuToProjected,
      storageToDate,
      storageToProjected,
    },
  };
}

export async function getQuarterlyCosts(licencePlate: string, year: number, quarter: number) {
  const { startDate, endDate } = getQuarterStartEndDate(year, quarter);

  const result = {
    ...(await getCostsBasedOnMonths(TimeView.Quarterly, licencePlate, startDate, endDate)),
    billingPeriod: `${dateRangeFormatter.format(startDate)}—${dateRangeFormatter.format(endDate)}, ${year}`,
  };

  return result;
}

export async function getYearlyCosts(licencePlate: string, yearString: string) {
  const year = parseInt(yearString, 10);
  const { startDate, endDate } = getYearlyStartEndDate(year);

  const result = {
    ...(await getCostsBasedOnMonths(TimeView.Yearly, licencePlate, startDate, endDate)),
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

function getResourceValuesFromDate(items: CostItem[], date: Date) {
  const entry = items.find((item) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    return date >= start && date < end;
  });

  return {
    cpu: entry?.total.cpu.value,
    storage: entry?.total.storage.value,
  };
}

function getSummaryData(items: CostItem[], year: number, month: number): DailyDiscreteValue {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let cpuSum = 0;
  let storageSum = 0;
  let daysWithData = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const values = getResourceValuesFromDate(items, date);

    if (values.cpu! > 0 || values.storage! > 0) {
      cpuSum += values.cpu!;
      storageSum += values.storage!;
      daysWithData++;
    }
  }

  const avgCpu = daysWithData ? cpuSum / daysWithData : 0;
  const avgStorage = daysWithData ? storageSum / daysWithData : 0;

  return {
    cpu: roundToHalfIncrement(avgCpu),
    storage: roundToHalfIncrement(avgStorage),
  };
}

function getDiscreteResourceValues(
  items: CostItem[],
  timeView?: TimeView,
): DailyDiscreteValue[] | QuarterlyDiscreteValue | YearlyDiscreteValue {
  if (!items?.length) return timeView === TimeView.Monthly ? [] : {};

  const year = new Date(items[0].startDate).getFullYear();
  const month = new Date(items[0].startDate).getMonth();

  if (timeView === TimeView.Monthly) {
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    return Array.from({ length: daysInMonth }, (_, idx) => {
      const currentDate = new Date(year, month, idx + 1);
      const { cpu = 0, storage = 0 } = getResourceValuesFromDate(items, currentDate) ?? {};

      return {
        cpu: roundToHalfIncrement(cpu),
        storage: roundToHalfIncrement(storage),
      };
    });
  }

  if (timeView === TimeView.Quarterly) {
    const quarterlyDiscreteValues = {};
    for (let m = 0; m < 3; m++) {
      const currentMonth = (month + m) % 12;
      const currentYear = year + Math.floor((month + m) / 12);
      quarterlyDiscreteValues[currentMonth + 1] = getSummaryData(items, currentYear, currentMonth);
    }
    return quarterlyDiscreteValues;
  }

  const yearlyDiscreteValues = {};
  for (let m = 0; m < 12; m++) {
    yearlyDiscreteValues[m + 1] = getSummaryData(items, year, m);
  }
  return yearlyDiscreteValues;
}
