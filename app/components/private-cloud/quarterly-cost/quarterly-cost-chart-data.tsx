import { TooltipItem } from 'chart.js';
import { QuarterlyCost } from '@/types/private-cloud';
import { formatCurrency, getMonthNameFromNumber } from '@/utils/js';

export function getQuarterlyCostChartConfig({ data }: { data: Pick<QuarterlyCost, 'months' | 'monthDetails'> }) {
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
    labels: data.months.map(getMonthNameFromNumber),
    datasets: [
      {
        label: 'CPU Cost (CA$)',
        data: data.monthDetails.cpuToDate,
        backgroundColor: '#1E3A8A',
      },
      {
        label: 'Storage Cost (CA$)',
        data: data.monthDetails.storageToDate,
        backgroundColor: '#047857',
      },
      {
        label: 'CPU Cost - Projected (CA$)',
        data: data.monthDetails.cpuToProjected,
        backgroundColor: '#A7C7E7',
      },
      {
        label: 'Storage Cost - Projected (CA$)',
        data: data.monthDetails.storageToProjected,
        backgroundColor: '#A8D5BA',
      },
    ],
  };

  return { options, data: chartData };
}
