import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { PeriodCosts } from '@/types/private-cloud';
import { getQuarterlyCostChartConfig } from './quarterly-cost-chart-data';

export default function QuarterlyCostChart({
  data,
  forecast = true,
}: {
  data: Pick<PeriodCosts, 'timeUnits' | 'timeDetails' | 'billingPeriod'>;
  forecast?: boolean;
}) {
  const { options, data: chartData } = getQuarterlyCostChartConfig({ data, forecast });

  return (
    <Card className="border mx-16 mb-16 mt-3">
      <h1 className="m-4 text-xl mt-0 text-center">Monthly cost breakdown from {data.billingPeriod}</h1>
      <div className="relative min-h-180">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
