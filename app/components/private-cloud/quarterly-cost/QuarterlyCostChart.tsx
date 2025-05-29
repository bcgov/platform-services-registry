import { Card, Title } from '@tremor/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { QuarterlyCost } from '@/types/private-cloud';
import { getQuarterlyCostChartConfig } from './quarterly-cost-chart-data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function QuarterlyCostChart({ data }: { data: Pick<QuarterlyCost, 'months' | 'monthDetails'> }) {
  const { options, data: chartData } = getQuarterlyCostChartConfig({ data });

  return (
    <Card>
      <Title>Quarterly Cost Breakdown for the selected quarter</Title>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
