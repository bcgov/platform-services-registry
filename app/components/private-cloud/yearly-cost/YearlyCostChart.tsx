import { Card, Title } from '@mantine/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  TooltipItem,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { YearlyCostDataWithMonthName } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

interface YearlyCostChartProps {
  data: YearlyCostDataWithMonthName[];
  title: string;
}

export const options = {
  plugins: {
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<'bar'>) {
          const value = context.parsed.y;
          return formatCurrency(value);
        },
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
        callback: function (value: string | number, index: number, ticks: any) {
          return formatCurrency(Number(value));
        },
      },
    },
  },
};

export default function YearlyCostChart({ data, title }: YearlyCostChartProps) {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        label: 'CPU Cost CA($)',
        data: data.map((item) => item.cpuCost),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Storage Cost CA($)',
        data: data.map((item) => item.storageCost),
        backgroundColor: '#9966FF',
      },
    ],
  };

  return (
    <Card className="w-full mb-6 rounded-md border p-6 shadow-sm">
      <Title order={2} className="text-center mb-4">
        {title}
      </Title>
      <div className="relative h-96 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
