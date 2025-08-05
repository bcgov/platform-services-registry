import CostStatusBadge from '@/components/badges/CostStatusBadge';
import { ColumnDefinition } from '@/components/generic/data-table/DataTable';
import { Cluster, Prisma, ResourceRequestsEnv, ResourceRequests, PrivateCloudProductMemberRole } from '@/prisma/client';
import { PeriodCostItem, CostDetailTableDataRow } from '@/types/private-cloud';
import { formatCurrency, formatNumber, getMonthNameFromNumber } from '@/utils/js';
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

export const periodCostItemTableColumns: ColumnDefinition<PeriodCostItem>[] = [
  { label: 'Data Range', value: 'startDate', cellProcessor: (item, attr) => CostStatusBadge(item) },
  {
    label: 'CPU (Cores)',
    value: 'total.cpu.value',
    cellProcessor: (item, attr) =>
      formatNumber(item.total.cpu.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
  },
  {
    label: 'Storage (GiB)',
    value: 'total.storage.value',
    cellProcessor: (item, attr) =>
      formatNumber(item.total.storage.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
  },
  {
    label: 'CPU Unit Price (year)',
    value: 'cpuPricePerYear',
    cellProcessor: (item, attr) => formatCurrency(item.cpuPricePerYear, { zeroAsEmpty: true }),
  },
  {
    label: 'Storage Unit Price (year)',
    value: 'storagePricePerYear',
    cellProcessor: (item, attr) => formatCurrency(item.storagePricePerYear, { zeroAsEmpty: true }),
  },
  {
    label: 'CPU Cost',
    value: 'total.cpu.cost',
    cellProcessor: (item) => formatCurrency(item.total.cpu.cost, { zeroAsEmpty: true }),
  },
  {
    label: 'Storage Cost',
    value: 'total.storage.cost',
    cellProcessor: (item, attr) => formatCurrency(item.total.storage.cost, { zeroAsEmpty: true }),
  },
  {
    label: 'Total Cost',
    value: 'total.subtotal.cost',
    cellProcessor: (item, attr) => formatCurrency(item.total.subtotal.cost, { zeroAsEmpty: true }),
  },
];

const generatePeriodCostDetailTableColumns = (forecast: boolean): ColumnDefinition<CostDetailTableDataRow>[] => {
  if (forecast) {
    return [
      {
        label: 'CPU (cores)',
        value: 'cpuQuota',
        cellProcessor: (item) => formatNumber(item.cpuQuota, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
      },
      {
        label: 'CPU Cost',
        value: 'cpuCost',
        cellProcessor: (item) => formatCurrency(item.cpuCost, { zeroAsEmpty: true }),
      },
      {
        label: 'Storage (GiB)',
        value: 'storageQuota',
        cellProcessor: (item) =>
          formatNumber(item.storageQuota, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
      },
      {
        label: 'Storage Cost',
        value: 'storageCost',
        cellProcessor: (item) => formatCurrency(item.storageCost, { zeroAsEmpty: true }),
      },
      {
        label: 'Total Cost',
        value: 'cost',
        cellProcessor: (item) => formatCurrency(item.cost, { zeroAsEmpty: true }),
      },
    ];
  }

  return [
    {
      label: 'CPU (cores)',
      value: 'cpuQuotaToDate',
      cellProcessor: (item) =>
        formatNumber(item.cpuQuotaToDate, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
    },
    {
      label: 'CPU Cost',
      value: 'cpuCostToDate',
      cellProcessor: (item) => formatCurrency(item.cpuCostToDate, { zeroAsEmpty: true }),
    },
    {
      label: 'Storage (GiB)',
      value: 'storageQuotaToDate',
      cellProcessor: (item) =>
        formatNumber(item.storageQuotaToDate, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
    },
    {
      label: 'Storage Cost',
      value: 'storageCostToDate',
      cellProcessor: (item) => formatCurrency(item.storageCostToDate, { zeroAsEmpty: true }),
    },
    {
      label: 'Total Cost',
      value: 'costToDate',
      cellProcessor: (item) => formatCurrency(item.costToDate, { zeroAsEmpty: true }),
    },
  ];
};

export const generateDailyCostDetailTableColumns = (forecast: boolean): ColumnDefinition<CostDetailTableDataRow>[] => {
  return [
    { label: 'Day', value: 'timeUnit', cellProcessor: (item) => item.timeUnit },
    ...generatePeriodCostDetailTableColumns(forecast),
  ];
};

export const generateMonthlyCostDetailTableColumns = (
  forecast: boolean,
): ColumnDefinition<CostDetailTableDataRow>[] => {
  return [
    { label: 'Month', value: 'timeUnit', cellProcessor: (item) => item.timeUnit },
    ...generatePeriodCostDetailTableColumns(forecast),
  ];
};
