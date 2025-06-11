import { Card, Title } from '@tremor/react';
import { Bar } from 'react-chartjs-2';
import { YearlyCost } from '@/types/private-cloud';
import { getYearlyCostChartConfig } from './yearly-cost-chart-data';

export default function YearlyCostChart({ data }: { data: Pick<YearlyCost, 'months' | 'monthDetails'> }) {
  const { options, data: chartData } = getYearlyCostChartConfig({ data });

  return (
    <Card>
      <Title>Monthly Cost Breakdown for the selected year</Title>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
