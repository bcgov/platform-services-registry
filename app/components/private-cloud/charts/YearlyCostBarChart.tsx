import { LoadingOverlay } from '@mantine/core';
import { Card, BarChart, Title } from '@tremor/react';
import { CostDataWithMonthName, transformToChartData } from '@/helpers/product';
import { getAllMonthNames } from '@/utils/js';

export default function YearlyCostBarChart({
  index,
  chartData,
  title,
  categories,
  isLoading = false,
}: {
  index: string;
  chartData: CostDataWithMonthName[];
  title: string;
  categories: string[];
  isLoading?: boolean;
}) {
  const transformedChartData = transformToChartData(chartData, getAllMonthNames());
  return (
    <div className="flex flex-col items-end mb-6">
      <Card>
        <Title className="text-center text-lg font-bold">{title}</Title>
        <div className="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
          <BarChart
            className="mt-6"
            data={transformedChartData}
            index={index}
            categories={categories}
            colors={['cyan', 'purple']}
            yAxisWidth={40}
            showXAxis
            showGridLines
            enableLegendSlider
            stack
          />
        </div>
      </Card>
    </div>
  );
}
