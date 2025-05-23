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
import { YearlyCostData } from '@/types/private-cloud';
import { getYearlyCostChartConfig } from './yearly-cost-chart-data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function YearlyCostChart({ yearlyCostData }: { yearlyCostData: YearlyCostData[] }) {
  const { options, data: chartData } = getYearlyCostChartConfig(yearlyCostData);

  return (
    <Card>
      <Title>Monthly Cost Breakdown for the selected year</Title>
      <div className="relative">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
