import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type TooltipItem,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { valueFormatter as defaultValueFormatter, getColor } from '@/components/analytics/helpers';
import { cn } from '@/utils/js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export interface BarChartDataItem {
  [key: string]: number | string;
}
export default function BarChart({
  indexKey,
  data: chartData,
  valueFormatter,
  className,
}: {
  indexKey: string;
  data: BarChartDataItem[];
  valueFormatter?: (value: number) => string;
  className?: string;
}) {
  const { data, options } = useMemo(() => {
    if (!chartData) return { data: { labels: [], datasets: [] } as ChartData<'bar'>, options: {} };

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
    const vf = valueFormatter ?? defaultValueFormatter;
    const _options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { position: 'top' },
        title: { display: false, text: '' },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => {
              const label = ctx.dataset.label ?? 'Unknown';
              const val = typeof ctx.parsed === 'object' ? (ctx.parsed as { y?: number }).y ?? 0 : 0;
              return `${label}: ${vf(val)}`;
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
  }, [chartData, indexKey, valueFormatter]);

  return <Bar className={cn(className)} data={data} options={options} />;
}
