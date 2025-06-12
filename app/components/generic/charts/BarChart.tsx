import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import { cn } from '@/utils/js';

export interface BarChartDataItem {
  [key: string]: number | string;
}
export default function BarChart({
  indexKey,
  data: chartData,
  className,
}: {
  indexKey: string;
  data: BarChartDataItem[];
  className?: string;
}) {
  const { data, options } = useMemo(() => {
    if (!chartData) return { data: { labels: [], datasets: [] }, options: {} };

    const labels: string[] = [];
    const datasetMap: Record<string, number[]> = {};

    for (const row of chartData) {
      for (const [key, value] of Object.entries(row)) {
        if (key === indexKey) {
          labels.push(String(value));
          continue;
        }

        if (!datasetMap[key]) {
          datasetMap[key] = [];
        }

        datasetMap[key].push(Number(value));
      }
    }

    const _data = {
      labels,
      datasets: Object.entries(datasetMap).map(([label, data], index) => ({
        label,
        data,
        backgroundColor: getColor(index),
        borderRadius: 4,
        barThickness: 'flex' as const,
      })),
    };

    const _options = {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false,
          text: '',
        },
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
              const label = context.dataset.label || 'Unknown';
              const value = valueFormatter(Number(context.raw as number));
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          ticks: {
            callback: (value: string | number) => `${value}%`,
          },
          beginAtZero: true,
        },
      },
    };

    return { data: _data, options: _options };
  }, [chartData]);

  return <Bar className={cn(className)} data={data} options={options} />;
}
