import { TooltipItem } from 'chart.js';
import { MonthlyCost } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

const options = {
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

export function getMonthlyCostChartConfig({ data }: { data: Pick<MonthlyCost, 'days' | 'dayDetails'> }) {
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
