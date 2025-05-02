import { TooltipItem } from 'chart.js';
import { YearlyCostData } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export function getYearlyCostChartConfig(yearlyData: YearlyCostData[]) {
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
