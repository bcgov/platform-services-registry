import { TooltipItem } from 'chart.js';
import { YearlyCostChartProps } from '@/types/private-cloud';
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

export function getYearlyCostChartConfig(yearlyData: YearlyCostChartProps) {
  const chartData = {
    labels: yearlyData.data.map((item) => item.month),
    datasets: [
      {
        label: 'CPU Cost CA($)',
        data: yearlyData.data.map((item) => item.cpuCost),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Storage Cost CA($)',
        data: yearlyData.data.map((item) => item.storageCost),
        backgroundColor: '#9966FF',
      },
    ],
  };

  return { options, data: chartData };
}
