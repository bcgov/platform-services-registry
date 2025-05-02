import { TooltipItem } from 'chart.js';
import { YearlyCostData } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export const options = {
  plugins: {
    title: {
      display: false,
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
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
        callback: function (value: string | number, index: number, ticks: any) {
          return formatCurrency(Number(value));
        },
      },
    },
  },
};

export function getYearlyCostChartConfig(yearlyData: YearlyCostData[]) {
  const chartData = {
    labels: yearlyData.map((item) => item.monthName),
    datasets: [
      {
        label: 'CPU Cost CA($)',
        data: yearlyData.map((item) => item.cpuCost),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Storage Cost CA($)',
        data: yearlyData.map((item) => item.storageCost),
        backgroundColor: '#9966FF',
      },
    ],
  };

  return { options, data: chartData };
}
