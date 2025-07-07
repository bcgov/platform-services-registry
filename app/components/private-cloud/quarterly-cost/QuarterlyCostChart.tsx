import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { QuarterlyCost } from '@/types/private-cloud';
import { getQuarterlyCostChartConfig } from './quarterly-cost-chart-data';

export default function QuarterlyCostChart({
  data,
  isForecastEnabled = true,
}: {
  data: Pick<QuarterlyCost, 'months' | 'monthDetails' | 'billingPeriod'>;
  isForecastEnabled?: boolean;
}) {
  const { options, data: chartData } = getQuarterlyCostChartConfig({ data, isForecastEnabled });

  return (
    <Card className="border mx-16 mb-16 mt-3">
      <h1 className="m-4 text-xl mt-0 text-center">Daily cost breakdown from {data.billingPeriod}</h1>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
