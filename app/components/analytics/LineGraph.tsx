'use client';

import { LoadingOverlay } from '@mantine/core';
import { Card, LineChart, Title, Subtitle } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = (number: number) => ` ${new Intl.NumberFormat('us').format(number).toString()}`;

export default function Chart({
  index,
  subtitle,
  onExport,
  exportApiEndpoint,
  chartData,
  title,
  categories,
  isLoading = false,
}: {
  index: string;
  subtitle: string;
  onExport?: () => Promise<boolean>;
  exportApiEndpoint?: string;
  chartData: any;
  title: string;
  categories: string[];
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" onExport={onExport} downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
          <LineChart
            className="mt-6"
            data={chartData}
            index={index}
            categories={categories}
            colors={[
              'cyan',
              'blue',
              'indigo',
              'violet',
              'fuchsia',
              'rose',
              'teal',
              'lime',
              'amber',
              'zinc',
              'yellow',
              'sky',
              'stone',
              'orange',
              'pink',
            ]}
            valueFormatter={valueFormatter}
            yAxisWidth={40}
            showXAxis
            showGridLines
            enableLegendSlider
          />
        </div>
      </Card>
    </div>
  );
}
