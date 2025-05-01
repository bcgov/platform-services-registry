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
import { YearlyCostDataWithMonthName } from '@/helpers/product';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

interface YearlyCostChartProps {
  chartData: YearlyCostDataWithMonthName[];
  title: string;
}

export default function YearlyCostChart({ chartData, title }: YearlyCostChartProps) {
  const chartProperties = {
    labels: chartData.map((item) => item.month),
    datasets: [
      {
        label: 'CPU Cost',
        data: chartData.map((item) => item.cpuCost),
        backgroundColor: '#36A2EB',
        hoverBackgroundColor: '#36A2EB',
      },
      {
        label: 'Storage Cost',
        data: chartData.map((item) => item.storageCost),
        backgroundColor: '#9966FF',
        hoverBackgroundColor: '#9966FF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterBody: function (context: TooltipItem<'bar'>[]) {
            const dataIndex = context[0].dataIndex;
            return `Total Cost: ${chartData[dataIndex]['Total Cost']}`;
          },
        },
      },
    },
  };

  return (
    <Card className="w-full mb-6 rounded-md border p-6 shadow-sm">
      <Title order={2} className="text-center mb-4">
        {title}
      </Title>
      <div className="relative h-96 w-full">
        <Bar
          data={chartProperties}
          options={options}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </Card>
  );
}
