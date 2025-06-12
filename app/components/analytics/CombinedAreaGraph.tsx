import { LoadingOverlay } from '@mantine/core';
import { Card, Title, Subtitle } from '@tremor/react';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import ExportButton from '@/components/buttons/ExportButton';

export type ChartDate = {
  date: string;
};

export default function CombinedAreaGraph({
  title,
  subtitle,
  onExport,
  chartData,
  categories,
  colors,
  isLoading = false,
  exportApiEndpoint /* temporary */,
}: {
  title: string;
  subtitle: string;
  onExport?: () => Promise<boolean>;
  chartData: any;
  categories: string[];
  colors: string[];
  isLoading?: boolean;
  exportApiEndpoint?: string /* temporary */;
}) {
  const { data, options } = useMemo(() => {
    if (!chartData) return { data: { labels: [], datasets: [] }, options: {} };

    const labels: string[] = [];
    const datasetMap: Record<string, number[]> = {};

    for (const row of chartData) {
      for (const [key, value] of Object.entries(row)) {
        if (key === 'date') {
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
    };

    return { data: _data, options: _options };
  }, [chartData]);

  return (
    <div className="flex flex-col items-end">
      <ExportButton onExport={onExport} downloadUrl={exportApiEndpoint} /* temporary */ className="m-2" />
      <Card className="relative">
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
          <Line className="max-h-[28rem] mt-4" data={data} options={options} />
        </div>
      </Card>
    </div>
  );
}
