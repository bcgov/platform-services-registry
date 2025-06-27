import { TooltipItem } from 'chart.js';
import { YearlyCost } from '@/types/private-cloud';
import { formatCurrency, getMonthNameFromNumber } from '@/utils/js';

export function getYearlyCostChartConfig({ data }: { data: Pick<YearlyCost, 'months' | 'monthDetails'> }) {
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
      zoom: {
        pan: {
          enabled: true,
          mode: 'y' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'y' as const,
          drag: {
            enabled: false,
          },
        },
        limits: {
          y: { min: 0 },
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
