import { LoadingOverlay } from '@mantine/core';
import { Card } from '@mantine/core';
import ExportButton from '@/components/buttons/ExportButton';
import LineChart, { LineChartDataItem } from '@/components/generic/charts/LineChart';

export default function LineChartCard({
  index,
  title,
  subtitle,
  onExport,
  chartData,
  categories,
  isLoading = false,
  exportApiEndpoint /* temporary */,
}: {
  index: string;
  title: string;
  subtitle: string;
  onExport?: () => Promise<boolean>;
  chartData?: LineChartDataItem[];
  categories: string[];
  isLoading?: boolean;
  exportApiEndpoint?: string /* temporary */;
}) {
  if (!chartData) return null;

  return (
    <div>
      <div className="text-right">
        <ExportButton onExport={onExport} downloadUrl={exportApiEndpoint} className="m-2" />
      </div>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <h2>{title}</h2>
        <h5 className="text-gray-600">{subtitle}</h5>
        <div className="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
          <LineChart className="max-h-[28rem] mt-4" data={chartData} indexKey={index} />
        </div>
      </Card>
    </div>
  );
}
