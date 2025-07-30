import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { PeriodCosts } from '@/types/private-cloud';
import { getMonthlyCostChartConfig } from './monthly-cost-chart-data';

export default function MonthlyCostChart({
  data,
  isForecastEnabled = true,
}: {
  data: Pick<PeriodCosts, 'timeUnits' | 'timeDetails' | 'billingPeriod'>;
  isForecastEnabled?: boolean;
}) {
  const { options, data: chartData } = getMonthlyCostChartConfig({ data, isForecastEnabled });

  return (
    <Card className="border mx-16 mb-16 mt-3">
      <h1 className="m-4 text-xl mt-0 text-center">Daily cost breakdown from {data.billingPeriod}</h1>
      <div className="relative min-h-180">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
