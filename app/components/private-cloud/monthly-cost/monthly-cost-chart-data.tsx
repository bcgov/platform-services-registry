import { TooltipItem } from 'chart.js';
import { MonthlyCost } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export function getMonthlyCostChartConfig({ data }: { data: Pick<MonthlyCost, 'days' | 'dayDetails'> }) {
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

  const chartData = {
    labels: data.days,
    datasets: [
      {
        label: 'CPU Cost (CA$)',
        data: data.dayDetails.cpuToDate,
        backgroundColor: '#1E3A8A',
      },
      {
        label: 'Storage Cost (CA$)',
        data: data.dayDetails.storageToDate,
        backgroundColor: '#047857',
      },
      {
        label: 'CPU Cost - Projected (CA$)',
        data: data.dayDetails.cpuToProjected,
        backgroundColor: '#A7C7E7',
      },
      {
        label: 'Storage Cost - Projected (CA$)',
        data: data.dayDetails.storageToProjected,
        backgroundColor: '#A8D5BA',
      },
    ],
  };

  return { options, data: chartData };
}
