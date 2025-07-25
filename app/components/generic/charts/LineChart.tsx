import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import { cn } from '@/utils/js';

export interface LineChartDataItem {
  [key: string]: number | string;
}
export default function LineChart({
  indexKey,
  data: chartData,
  className,
}: {
  indexKey: string;
  data: LineChartDataItem[];
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
        borderColor: getColor(index),
        backgroundColor: getColor(index, 0.2),
        tension: 0.4,
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
              const value = valueFormatter(context.raw as number);
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
            callback: (value: string | number) => value,
          },
          beginAtZero: true,
        },
      },
    };

    return { data: _data, options: _options };
  }, [chartData]);

  return <Line className={cn(className)} data={data} options={options} />;
}
