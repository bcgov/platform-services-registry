import CostStatusBadge from '@/components/badges/CostStatusBadge';
import { ColumnDefinition } from '@/components/generic/data-table/DataTable';
import { Cluster, Prisma, ResourceRequestsEnv, ResourceRequests, PrivateCloudProductMemberRole } from '@/prisma/client';
import { CostMetric, DailyCostMetric, MonthlyCostMetric, PeriodicCostMetric, PeriodCosts } from '@/types/private-cloud';
import { formatCurrency, getMonthNameFromNumber } from '@/utils/js';
import { productSorts } from './common';

export const privateCloudProductMemberRoles = Object.values(PrivateCloudProductMemberRole);
export const clusters = Object.values(Cluster);
export const clustersWithoutDR = Object.values(Cluster).filter((cluster) => cluster !== 'GOLDDR');

export const clusterNames = [
  {
    id: 1,
    name: 'clab',
    label: 'CLAB Calgary',
  },
  {
    id: 2,
    name: 'klab',
    label: 'KLAB Kamloops',
  },
  {
    id: 3,
    name: 'silver',
    label: 'Silver Kamloops',
  },
  {
    id: 4,
    name: 'gold',
    label: 'Gold Kamloops',
  },
  {
    id: 5,
    name: 'golddr',
    label: 'Gold (DR) Calgary',
  },
  {
    id: 6,
    name: 'klab2',
    label: 'KLAB2 Kamloops',
  },
  {
    id: 7,
    name: 'emerald',
    label: 'Emerald Hosting tier',
  },
];

export type DropdownOption = { label: string; value: string; key: number };

export const defaultResourceRequests = {
  cpu: 0.5,
  memory: 2,
  storage: 1,
};

export const privateCloudProductSorts = productSorts.concat([
  {
    label: 'Cluster (A-Z)',
    sortKey: 'cluster',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Cluster (Z-A)',
    sortKey: 'cluster',
    sortOrder: Prisma.SortOrder.desc,
  },
]);

export const environmentShortNames = {
  development: 'dev',
  test: 'test',
  production: 'prod',
  tools: 'tools',
} as const;

export type EnvironmentShortName = keyof typeof environmentShortNames;
export const environmentLongKeys = Object.keys(environmentShortNames) as Array<EnvironmentShortName>;

export const environmentLongNames = {
  dev: 'development',
  test: 'test',
  prod: 'production',
  tools: 'tools',
} as const;

export const environmentShortKeys = Object.keys(environmentLongNames) as Array<keyof typeof environmentLongNames>;

export type ResourceRequestsEnvKeys = Array<keyof ResourceRequestsEnv>;
export type ResourceRequestsKeys = Array<keyof ResourceRequests>;

export const namespaceKeys: ResourceRequestsEnvKeys = ['development', 'test', 'production', 'tools'];
export const resourceKeys: ResourceRequestsKeys = ['cpu', 'memory', 'storage'];

export const periodicCostCommonColumns = <T extends PeriodicCostMetric>(): ColumnDefinition<T>[] => [
  { label: 'CPU (Cores)', value: 'total.cpu.value', cellProcessor: (item, attr) => item.total.cpu.value },
  { label: 'Storage (GiB)', value: 'total.storage.value', cellProcessor: (item, attr) => item.total.storage.value },
  { label: 'CPU Cost', value: 'total.cpu.cost', cellProcessor: (item) => formatCurrency(item.total.cpu.cost) },
  {
    label: 'Storage Cost',
    value: 'total.storage.cost',
    cellProcessor: (item, attr) => formatCurrency(item.total.storage.cost),
  },
  {
    label: 'Total Cost',
    value: 'total.subtotal.cost',
    cellProcessor: (item, attr) => formatCurrency(item.total.subtotal.cost),
  },
];

type CostDetails<T extends string> = Record<T, CostMetric>;

const createCostColumns = <T extends CostDetails<K>, K extends string>(detailsKey: K): ColumnDefinition<T>[] => [
  {
    label: 'CPU (cores)',
    value: `${detailsKey}.cpuCore`,
    cellProcessor: (item) =>
      item[detailsKey].totalCost === 0 || item[detailsKey].cpuToDate === 0 ? 'N/A' : item[detailsKey].cpuCore,
  },
  {
    label: 'CPU Cost',
    value: `${detailsKey}.cpuToDate`,
    cellProcessor: (item) => (item[detailsKey].totalCost === 0 ? 'N/A' : formatCurrency(item[detailsKey].cpuToDate)),
  },
  {
    label: 'Storage (GiB)',
    value: `${detailsKey}.storageGib`,
    cellProcessor: (item) => (item[detailsKey].totalCost === 0 ? 'N/A' : item[detailsKey].storageGib),
  },
  {
    label: 'Storage Cost',
    value: `${detailsKey}.storageToDate`,
    cellProcessor: (item) =>
      item[detailsKey].totalCost === 0 ? 'N/A' : formatCurrency(item[detailsKey].storageToDate),
  },
  {
    label: 'Total Cost',
    value: `${detailsKey}.totalCost`,
    cellProcessor: (item) => {
      const value = item[detailsKey].totalCost;
      return value === 0 ? 'N/A' : formatCurrency(value);
    },
  },
];

export const monthlyCostCommonColumns = <T extends MonthlyCostMetric>(): ColumnDefinition<T>[] =>
  createCostColumns<T, 'timeDetails'>('timeDetails');

export const dailyCostCommonColumns = <T extends DailyCostMetric>(): ColumnDefinition<T>[] =>
  createCostColumns<T, 'timeDetails'>('timeDetails');

export const periodicCostColumns: ColumnDefinition<PeriodicCostMetric>[] = [
  { label: 'Data Range', value: 'startDate', cellProcessor: (item, attr) => CostStatusBadge(item) },
  ...periodicCostCommonColumns<PeriodicCostMetric>(),
];

export const dailyCostColumns: ColumnDefinition<DailyCostMetric>[] = [
  { label: 'Day', value: 'day', cellProcessor: (item) => item.day },
  ...dailyCostCommonColumns<DailyCostMetric>(),
];

export const monthlyCostColumns: ColumnDefinition<MonthlyCostMetric>[] = [
  { label: 'Month', value: 'month', cellProcessor: (item) => getMonthNameFromNumber(item.month) },
  ...monthlyCostCommonColumns<MonthlyCostMetric>(),
];

export function getDailyCostData(costData: PeriodCosts): DailyCostMetric[] {
  return costData.timeUnits.map((day, idx) => {
    const { cpuToDate, storageToDate } = costData.timeDetails;
    const totalCost = cpuToDate[idx] + storageToDate[idx];

    return {
      day,
      timeDetails: {
        cpuToDate: cpuToDate[idx],
        storageToDate: storageToDate[idx],
        // cpuCore: costData.discreteResourceValues[idx].cpu,
        // storageGib: costData.discreteResourceValues[idx].storage,
        cpuCore: 0,
        storageGib: 0,
        totalCost,
      },
    };
  });
}

export function getMonthlyCostData(costData: PeriodCosts): MonthlyCostMetric[] {
  return costData.timeUnits.map((month, idx) => {
    const { cpuToDate, storageToDate } = costData.timeDetails;
    const totalCost = cpuToDate[idx] + storageToDate[idx];

    return {
      month,
      timeDetails: {
        cpuToDate: cpuToDate[idx],
        storageToDate: storageToDate[idx],
        // cpuCore: costData.discreteResourceValues[month].cpu,
        // storageGib: costData.discreteResourceValues[month].storage,
        cpuCore: 0,
        storageGib: 0,
        totalCost,
      },
    };
  });
}

export const calculateTotalCost = <T extends { timeDetails?: { totalCost: number } }>(data: T[]): number => {
  return data.reduce((sum, item) => {
    const cost = item.timeDetails?.totalCost ?? item.timeDetails?.totalCost ?? 0;
    return sum + cost;
  }, 0);
};
