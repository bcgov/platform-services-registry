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
import { YearlyCostChartProps } from '@/types/private-cloud';
import { getYearlyCostChartConfig } from './yearly-cost-chart-data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

export default function YearlyCostChart(yearlyData: YearlyCostChartProps) {
  const { options, data: chartData } = getYearlyCostChartConfig(yearlyData);

  return (
    <Card>
      <Title>Monthly Cost Breakdown for the selected year</Title>
      <div className="relative">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
