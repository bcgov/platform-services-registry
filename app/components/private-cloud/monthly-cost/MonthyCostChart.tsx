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
import { MonthlyCost } from '@/types/private-cloud';
import { getMonthlyCostChartConfig } from './monthly-cost-chart-data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function MonthlyCostChart({ data }: { data: Pick<MonthlyCost, 'days' | 'dayDetails'> }) {
  const { options, data: chartData } = getMonthlyCostChartConfig({ data });

  return (
    <Card>
      <Title>Daily Cost Breakdown for the selected month</Title>
      <div className="relative">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
