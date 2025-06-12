import { Card, Subtitle, Title } from '@tremor/react';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import ExportButton from '@/components/buttons/ExportButton';

export default function Histogram({
  index,
  onExport,
  exportApiEndpoint,
  chartData,
  title,
  subtitle,
  categories,
  colors,
}: {
  index: string;
  onExport?: () => Promise<boolean>;
  exportApiEndpoint?: string;
  chartData: any;
  title: string;
  subtitle?: string;
  categories: string[];
  colors: string[];
}) {
  const { data, options } = useMemo(() => {
    if (!chartData) return { data: { labels: [], datasets: [] }, options: {} };

    const labels: string[] = [];
    const datasetMap: Record<string, number[]> = {};

    for (const row of chartData) {
      for (const [key, value] of Object.entries(row)) {
        if (key === 'time') {
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

  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" onExport={onExport} downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className="relative">
          <Bar className="max-h-[28rem] mt-4" data={data} options={options} />
        </div>
      </Card>
    </div>
  );
}
