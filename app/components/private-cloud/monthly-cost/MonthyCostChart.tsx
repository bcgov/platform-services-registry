import { Card, Title } from '@tremor/react';
import { Bar } from 'react-chartjs-2';
import { MonthlyCost } from '@/types/private-cloud';
import { getMonthlyCostChartConfig } from './monthly-cost-chart-data';

export default function MonthlyCostChart({ data }: { data: Pick<MonthlyCost, 'days' | 'dayDetails'> }) {
  const { options, data: chartData } = getMonthlyCostChartConfig({ data });

  return (
    <Card>
      <Title>Daily Cost Breakdown for the selected month</Title>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
