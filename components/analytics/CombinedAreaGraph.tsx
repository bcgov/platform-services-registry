'use client';

import { AreaChart, Card, Title, Subtitle } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = function (number: number) {
  return new Intl.NumberFormat('us').format(number).toString();
};

export type ChartDate = {
  date: string;
};

export default function CombinedAreaGraph({
  title,
  subtitle,
  exportApiEndpoint,
  chartData,
  categories,
  colors,
}: {
  title: string;
  subtitle: string;
  exportApiEndpoint: string;
  chartData: any;
  categories: string[];
  colors: string[];
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <AreaChart
          className="h-72 mt-4"
          data={chartData}
          index="date"
          yAxisWidth={65}
          categories={categories}
          colors={colors}
          valueFormatter={valueFormatter}
        />
      </Card>
    </div>
  );
}
