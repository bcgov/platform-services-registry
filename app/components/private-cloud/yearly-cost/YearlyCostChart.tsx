import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { YearlyCost } from '@/types/private-cloud';
import { getYearlyCostChartConfig } from './yearly-cost-chart-data';

export default function YearlyCostChart({
  data,
  isForecastEnabled = true,
}: {
  data: Pick<YearlyCost, 'months' | 'monthDetails'>;
  isForecastEnabled?: boolean;
}) {
  const { options, data: chartData } = getYearlyCostChartConfig({ data, isForecastEnabled });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <h2>Monthly Cost Breakdown for the selected year</h2>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
