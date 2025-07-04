import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { MonthlyCost } from '@/types/private-cloud';
import { getMonthlyCostChartConfig } from './monthly-cost-chart-data';

export default function MonthlyCostChart({
  data,
  isForecastEnabled = true,
}: {
  data: Pick<MonthlyCost, 'days' | 'dayDetails'>;
  isForecastEnabled?: boolean;
}) {
  const { options, data: chartData } = getMonthlyCostChartConfig({ data, isForecastEnabled });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <h2>Daily Cost Breakdown for the selected month</h2>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
