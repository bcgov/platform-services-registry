'use client';

import { AreaChart, BarChart, Card, Flex, Switch, Title } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = (number: number) => `${new Intl.NumberFormat('us').format(number).toString()}%`;

export default function Histogram({
  index,
  exportApiEndpoint,
  chartData,
  title,
  categories,
  colors,
}: {
  index: string;
  exportApiEndpoint: string;
  chartData: any;
  title: string;
  categories: string[];
  colors: string[];
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <BarChart
          className="mt-6"
          data={chartData}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={valueFormatter}
          yAxisWidth={48}
        />
      </Card>
    </div>
  );
}
