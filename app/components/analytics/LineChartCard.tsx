import { LoadingOverlay } from '@mantine/core';
import { Card, Title, Subtitle } from '@tremor/react';
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
          <LineChart className="max-h-[28rem] mt-4" data={chartData} indexKey={index} />
        </div>
      </Card>
    </div>
  );
}
