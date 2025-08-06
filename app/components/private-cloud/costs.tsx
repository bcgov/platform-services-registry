import CostDetailTableDataRowBadge from '@/components/badges/CostDetailTableDataRowBadge';
import CostStatusBadge from '@/components/badges/CostStatusBadge';
import { ColumnDefinition } from '@/components/generic/data-table/DataTable';
import { PeriodCostItem, CostDetailTableDataRow } from '@/types/private-cloud';
import { formatCurrency, formatNumber } from '@/utils/js';

export const periodCostItemTableColumns: ColumnDefinition<PeriodCostItem>[] = [
  { label: 'Data Range', value: 'startDate', cellFormatter: (item, attr) => <CostStatusBadge item={item} /> },
  {
    label: 'CPU (Cores)',
    value: 'total.cpu.value',
    align: 'right',
    cellFormatter: (item, attr) =>
      formatNumber(item.total.cpu.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
  },
  {
    label: 'Storage (GiB)',
    value: 'total.storage.value',
    align: 'right',
    cellFormatter: (item, attr) =>
      formatNumber(item.total.storage.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
  },
  {
    label: 'CPU Unit Price (year)',
    value: 'cpuPricePerYear',
    align: 'right',
    cellFormatter: (item, attr) => formatCurrency(item.cpuPricePerYear, { zeroAsEmpty: true }),
  },
  {
    label: 'Storage Unit Price (year)',
    value: 'storagePricePerYear',
    align: 'right',
    cellFormatter: (item, attr) => formatCurrency(item.storagePricePerYear, { zeroAsEmpty: true }),
  },
  {
    label: 'CPU Cost',
    value: 'total.cpu.cost',
    align: 'right',
    cellFormatter: (item) => formatCurrency(item.total.cpu.cost, { zeroAsEmpty: true }),
  },
  {
    label: 'Storage Cost',
    value: 'total.storage.cost',
    align: 'right',
    cellFormatter: (item, attr) => formatCurrency(item.total.storage.cost, { zeroAsEmpty: true }),
  },
  {
    label: 'Total Cost',
    value: 'total.subtotal.cost',
    align: 'right',
    cellFormatter: (item, attr) => formatCurrency(item.total.subtotal.cost, { zeroAsEmpty: true }),
  },
];

const generatePeriodCostDetailTableColumns = (forecast: boolean): ColumnDefinition<CostDetailTableDataRow>[] => {
  if (forecast) {
    return [
      {
        label: 'CPU (cores)',
        value: 'cpuQuota',
        align: 'right',
        cellFormatter: (item) => formatNumber(item.cpuQuota, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
      },
      {
        label: 'CPU Cost',
        value: 'cpuCost',
        align: 'right',
        cellFormatter: (item) => formatCurrency(item.cpuCost, { zeroAsEmpty: true }),
      },
      {
        label: 'Storage (GiB)',
        value: 'storageQuota',
        align: 'right',
        cellFormatter: (item) =>
          formatNumber(item.storageQuota, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
      },
      {
        label: 'Storage Cost',
        value: 'storageCost',
        align: 'right',
        cellFormatter: (item) => formatCurrency(item.storageCost, { zeroAsEmpty: true }),
      },
      {
        label: 'Total Cost',
        value: 'cost',
        align: 'right',
        cellFormatter: (item) => formatCurrency(item.cost, { zeroAsEmpty: true }),
      },
    ];
  }

  return [
    {
      label: 'CPU (cores)',
      value: 'cpuQuotaToDate',
      align: 'right',
      cellFormatter: (item) =>
        formatNumber(item.cpuQuotaToDate, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
    },
    {
      label: 'CPU Cost',
      value: 'cpuCostToDate',
      align: 'right',
      cellFormatter: (item) => formatCurrency(item.cpuCostToDate, { zeroAsEmpty: true }),
    },
    {
      label: 'Storage (GiB)',
      value: 'storageQuotaToDate',
      align: 'right',
      cellFormatter: (item) =>
        formatNumber(item.storageQuotaToDate, { decimals: 2, keepDecimals: true, zeroAsEmpty: true }),
    },
    {
      label: 'Storage Cost',
      value: 'storageCostToDate',
      align: 'right',
      cellFormatter: (item) => formatCurrency(item.storageCostToDate, { zeroAsEmpty: true }),
    },
    {
      label: 'Total Cost',
      value: 'costToDate',
      align: 'right',
      cellFormatter: (item) => formatCurrency(item.costToDate, { zeroAsEmpty: true }),
    },
  ];
};

export const generateDailyCostDetailTableColumns = (forecast: boolean): ColumnDefinition<CostDetailTableDataRow>[] => {
  return [
    {
      label: 'Day',
      value: 'timeUnit',
      cellFormatter: (item) => <CostDetailTableDataRowBadge item={item} forecast={forecast} />,
    },
    ...generatePeriodCostDetailTableColumns(forecast),
  ];
};

export const generateMonthlyCostDetailTableColumns = (
  forecast: boolean,
): ColumnDefinition<CostDetailTableDataRow>[] => {
  return [
    { label: 'Month', value: 'timeUnit', cellFormatter: (item) => item.timeUnit },
    ...generatePeriodCostDetailTableColumns(forecast),
  ];
};
