import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
  type Plugin,
} from 'chart.js';
import _orderBy from 'lodash-es/orderBy';
import _sum from 'lodash-es/sum';
import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import { cn } from '@/utils/js';

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const { width, height, ctx } = chart;
    const values = (chart.data?.datasets?.[0]?.data ?? []) as number[];
    const total = _sum(values);
    ctx.restore();

    const fontSize = (height / 150).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = 'middle';

    const text = total.toString();
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.save();
  },
};

export interface DoughnutChartDataItem {
  label: string;
  value: number;
}
export default function DoughnutChart({
  data: chartData,
  className,
}: {
  data: DoughnutChartDataItem[];
  className?: string;
}) {
  const { data, options } = useMemo(() => {
    if (!chartData) return { data: { labels: [], datasets: [] }, options: {} };

    const orderedItems = _orderBy(chartData, ['value'], 'desc');

    const _data = {
      labels: orderedItems.map((v) => v.label),
      datasets: [
        {
          data: orderedItems.map((v) => v.value),
          backgroundColor: orderedItems.map((v, ind) => getColor(ind)),
          hoverOffset: 10,
        },
      ],
    };

    const _options: ChartOptions<'doughnut'> = {
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context: TooltipItem<'doughnut'>) {
              const value = valueFormatter(context.parsed);
              return value;
            },
          },
        },
      },
    };

    return { data: _data, options: _options };
  }, [chartData]);

  return <Doughnut className={cn(className)} data={data} options={options} plugins={[centerTextPlugin]} />;
}
