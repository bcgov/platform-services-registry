import { IconZoomIn, IconZoomReset } from '@tabler/icons-react';
import { Card, Title } from '@tremor/react';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ZoomButton from '@/components/generic/ZoomButton';
import { MonthlyCost } from '@/types/private-cloud';
import { getMonthlyCostChartConfig } from './monthly-cost-chart-data';

type ZoomAction = '+' | 'reset';

export default function MonthlyCostChart({ data }: { data: Pick<MonthlyCost, 'days' | 'dayDetails'> }) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const { options, data: chartData } = getMonthlyCostChartConfig({ data, zoomLevel });

  const handleZoom = (action: ZoomAction) => {
    setZoomLevel(action === '+' ? zoomLevel + 4 : 1);
  };

  return (
    <Card>
      <Title>Daily Cost Breakdown for the selected month</Title>
      <div className="flex items-center gap-2 mt-4">
        <ZoomButton
          action="+"
          icon={<IconZoomIn size={30} className="text-gray-400" strokeWidth={1} />}
          zoomHandler={handleZoom}
        />
        <ZoomButton
          action="reset"
          icon={<IconZoomReset size={30} className="text-gray-400" strokeWidth={1} />}
          zoomHandler={handleZoom}
          disabled={zoomLevel === 1}
          toolTipLabel="Reset bar height"
        />
      </div>
      <div className="relative min-h-[45rem]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
