import { TooltipItem } from 'chart.js';
import { PeriodCosts } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export function getMonthlyCostChartConfig({
  data,
  forecast,
}: {
  data: Pick<PeriodCosts, 'timeUnits' | 'timeDetails'>;
  forecast?: boolean;
}) {
  const options = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            const value = context.parsed.y;
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
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: 12,
          },
          callback: function (value: string | number, index: number, ticks: any) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const dynamicChartData = [
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
    dynamicChartData.pop();
    dynamicChartData.pop();
  }

  const chartData = {
    labels: data.timeUnits,
    datasets: dynamicChartData,
  };

  return { options, data: chartData };
}
