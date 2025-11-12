import { TooltipItem } from 'chart.js';
import { PeriodCosts } from '@/types/private-cloud';
import { formatCurrency, getMonthNameFromNumber } from '@/utils/js';

type BaseArgs = {
  data: Pick<PeriodCosts, 'timeUnits' | 'timeDetails'>;
  forecast?: boolean;
};

function buildOptions() {
  return {
    plugins: {
      title: { display: false },
      legend: {
        labels: { font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            const value = typeof context.parsed.y === 'number' ? context.parsed.y : Number(context.raw as number);
            return formatCurrency(value);
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: { font: { size: 12 } },
      },
      y: {
        stacked: true,
        ticks: {
          font: { size: 12 },
          callback: function (value: string | number) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };
}

function buildDatasets(data: BaseArgs['data'], forecast?: boolean) {
  const datasets = [
    {
      label: 'CPU Cost (CA$)',
      data: data.timeDetails.cpuCostsToDate,
      backgroundColor: '#4CAF50',
    },
    {
      label: 'Storage Cost (CA$)',
      data: data.timeDetails.storageCostsToDate,
      backgroundColor: '#00CAFF',
    },
    {
      label: 'CPU Cost - Projected (CA$)',
      data: data.timeDetails.cpuCostsToProjected,
      backgroundColor: '#E0F7E1',
    },
    {
      label: 'Storage Cost - Projected (CA$)',
      data: data.timeDetails.storageCostsToProjected,
      backgroundColor: '#CCF2FF',
    },
  ];

  if (!forecast) {
    datasets.pop();
    datasets.pop();
  }

  return datasets;
}

export function getCostChartConfig({
  data,
  forecast,
  granularity,
}: {
  data: Pick<PeriodCosts, 'timeUnits' | 'timeDetails'>;
  forecast?: boolean;
  granularity: 'monthly' | 'quarterly' | 'yearly';
}) {
  const options = buildOptions();

  const labels = granularity === 'monthly' ? data.timeUnits : data.timeUnits.map(getMonthNameFromNumber);

  const chartData = {
    labels,
    datasets: buildDatasets(data, forecast),
  };

  return { options, data: chartData };
}

export function getMonthlyCostChartConfig(args: BaseArgs) {
  return getCostChartConfig({ ...args, granularity: 'monthly' });
}

export function getQuarterlyCostChartConfig(args: BaseArgs) {
  return getCostChartConfig({ ...args, granularity: 'quarterly' });
}

export function getYearlyCostChartConfig(args: BaseArgs) {
  return getCostChartConfig({ ...args, granularity: 'yearly' });
}
