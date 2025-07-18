import { Card } from '@mantine/core';
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
    <div>
      <div className="text-right">
        <ExportButton className="mb-4" onExport={onExport} downloadUrl={exportApiEndpoint} />
      </div>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <h2>{title}</h2>
        <h5 className="text-gray-600">{subtitle}</h5>
        <div className="relative">
          <BarChart className="max-h-112 mt-4" data={chartData} indexKey={index} valueFormatter={valueFormatter} />
        </div>
      </Card>
    </div>
  );
}
