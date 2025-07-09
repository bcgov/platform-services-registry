import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { YearlyCost } from '@/types/private-cloud';
import { getYearlyCostChartConfig } from './yearly-cost-chart-data';

export default function YearlyCostChart({
  data,
  isForecastEnabled = true,
}: {
  data: Pick<YearlyCost, 'months' | 'monthDetails' | 'billingPeriod'>;
  isForecastEnabled?: boolean;
}) {
  const { options, data: chartData } = getYearlyCostChartConfig({ data, isForecastEnabled });

  return (
    <Card className="border mx-16 mb-16 mt-3">
      <h1 className="m-4 text-xl mt-0 text-center">Monthly cost breakdown from {data.billingPeriod}</h1>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
