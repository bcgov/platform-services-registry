import CostDetailTableDataRowBadge from '@/components/badges/CostDetailTableDataRowBadge';
import CostStatusBadge from '@/components/badges/CostStatusBadge';
import { ColumnDefinition } from '@/components/generic/data-table/DataTable';
import { PeriodCostItem, CostDetailTableDataRow } from '@/types/private-cloud';
import { formatCurrency, formatNumber } from '@/utils/js';

export const periodCostItemTableColumns: ColumnDefinition<PeriodCostItem>[] = [
  { label: 'Data Range', value: 'startDate', cellProcessor: (item, attr) => <CostStatusBadge item={item} /> },
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
    {
      label: 'Day',
      value: 'timeUnit',
      cellProcessor: (item) => <CostDetailTableDataRowBadge item={item} forecast={forecast} />,
    },
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
