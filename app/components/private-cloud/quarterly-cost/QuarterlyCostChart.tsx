import { Card } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { QuarterlyCost } from '@/types/private-cloud';
import { getQuarterlyCostChartConfig } from './quarterly-cost-chart-data';

export default function QuarterlyCostChart({ data }: { data: Pick<QuarterlyCost, 'months' | 'monthDetails'> }) {
  const { options, data: chartData } = getQuarterlyCostChartConfig({ data });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <h2>Quarterly Cost Breakdown for the selected quarter</h2>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
