import { TooltipItem } from 'chart.js';
import { MonthlyCost } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export function getMonthlyCostChartConfig({
  data,
  isForecastEnabled,
}: {
  data: Pick<MonthlyCost, 'days' | 'dayDetails'>;
  isForecastEnabled: boolean;
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

  const updatedChartData = [
    {
      label: 'CPU Cost (CA$)',
      data: data.dayDetails.cpuToDate,
      backgroundColor: '#4CAF50',
    },
    {
      label: 'Storage Cost (CA$)',
      data: data.dayDetails.storageToDate,
      backgroundColor: '#00CAFF',
    },
    {
      label: 'CPU Cost - Projected (CA$)',
      data: data.dayDetails.cpuToProjected,
      backgroundColor: '#E0F7E1',
    },
    {
      label: 'Storage Cost - Projected (CA$)',
      data: data.dayDetails.storageToProjected,
      backgroundColor: '#CCF2FF',
    },
  ];

  if (!isForecastEnabled) {
    updatedChartData.pop();
    updatedChartData.pop();
  }

  const chartData = {
    labels: data.days,
    datasets: updatedChartData,
  };

  return { options, data: chartData };
}
