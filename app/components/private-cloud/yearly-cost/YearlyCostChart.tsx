import { LoadingOverlay } from '@mantine/core';
import { Card, Title } from '@mantine/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { ChartCompatibleMonthlyCostData } from '@/helpers/product';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

interface YearlyCostBarChartProps {
  chartData: ChartCompatibleMonthlyCostData[];
  title: string;
  isLoading?: boolean;
}

const datasetConfigs = [
  {
    label: 'CPU Cost',
    key: 'CPU Cost' as const,
    color: '54, 162, 235',
  },
  {
    label: 'Storage Cost',
    key: 'Storage Cost' as const,
    color: '153, 102, 255',
  },
];

export default function YearlyCostChart({ chartData, title, isLoading = false }: YearlyCostBarChartProps) {
  const getChartProperties = () => {
    return {
      labels: chartData.map((item) => item.month),
      datasets: datasetConfigs.map((config) => ({
        label: config.label,
        data: chartData.map((item) => item[config.key]),
        backgroundColor: `rgb(${config.color})`,
        hoverBackgroundColor: `rgba(${config.color}, 0.8)`,
      })),
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Month',
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Cost (CAD)',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterBody: function (context: any) {
            const dataIndex = context[0].dataIndex;
            return `Total Cost: $${chartData[dataIndex]['Total Cost']}`;
          },
        },
      },
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="w-full mb-6">
      <Card shadow="sm" padding="lg" radius="md" withBorder className="w-full">
        <Title order={2} className="text-center mb-4">
          {title}
        </Title>
        <div className="relative" style={{ height: '400px', width: '100%' }}>
          <LoadingOverlay
            visible={isLoading}
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
          <Chart
            type="bar"
            data={getChartProperties()}
            options={options}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </Card>
    </div>
  );
}
