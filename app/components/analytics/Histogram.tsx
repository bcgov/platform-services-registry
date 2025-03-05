'use client';

import { LoadingOverlay } from '@mantine/core';
import { BarChart, Card, Title } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = (number: number) => `${new Intl.NumberFormat('us').format(number).toString()}%`;

export default function Histogram({
  index,
  onExport,
  exportApiEndpoint,
  chartData,
  title,
  categories,
  colors,
}: {
  index: string;
  onExport?: () => Promise<boolean>;
  exportApiEndpoint?: string;
  chartData: any;
  title: string;
  categories: string[];
  colors: string[];
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" onExport={onExport} downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <div className="relative">
          <BarChart
            className="mt-6"
            data={chartData}
            index={index}
            categories={categories}
            colors={colors}
            valueFormatter={valueFormatter}
            yAxisWidth={48}
          />
        </div>
      </Card>
    </div>
  );
}
