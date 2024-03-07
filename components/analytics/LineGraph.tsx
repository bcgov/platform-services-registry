'use client';

import { Card, LineChart, Title, Subtitle } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = (number: number) => ` ${new Intl.NumberFormat('us').format(number).toString()}`;

export default function Chart({
  index,
  subtitle,
  exportApiEndpoint,
  chartData,
  title,
  categories,
}: {
  index: string;
  subtitle: string;
  exportApiEndpoint: string;
  chartData: any;
  title: string;
  categories: string[];
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" apiEnpoint={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>

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
      </Card>
    </div>
  );
}
