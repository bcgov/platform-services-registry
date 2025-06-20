import { Card, Subtitle, Title } from '@tremor/react';
import ExportButton from '@/components/buttons/ExportButton';
import BarChart, { BarChartDataItem } from '@/components/generic/charts/BarChart';

export default function BarChartCard({
  index,
  onExport,
  exportApiEndpoint,
  chartData,
  valueFormatter,
  title,
  subtitle,
  categories,
}: {
  index: string;
  onExport?: () => Promise<boolean>;
  exportApiEndpoint?: string;
  chartData: BarChartDataItem[];
  valueFormatter?: (value: number) => string;
  title: string;
  subtitle?: string;
  categories: string[];
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton className="mb-4" onExport={onExport} downloadUrl={exportApiEndpoint} />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className="relative">
          <BarChart className="max-h-[28rem] mt-4" data={chartData} indexKey={index} valueFormatter={valueFormatter} />
        </div>
      </Card>
    </div>
  );
}
