import { Card, Title, Subtitle } from '@tremor/react';
import type { Chart } from 'chart.js';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';
import { ChartOptions } from 'chart.js';
import _map from 'lodash-es/map';
import _orderBy from 'lodash-es/orderBy';
import _sum from 'lodash-es/sum';
import _sumBy from 'lodash-es/sumBy';
import { Doughnut } from 'react-chartjs-2';
import { valueFormatter, getColor } from '@/components/analytics/helpers';
import { formatNumber } from '@/utils/js';
import ExportButton from '../buttons/ExportButton';

const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart: Chart) => {
    const { width, height, ctx } = chart;
    ctx.restore();

    const fontSize = (height / 150).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = 'middle';

    const total = _sum(chart.data.datasets[0].data);

    const text = total.toString();
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.save();
  },
};

interface PieGraphItem {
  label: string;
  value: number;
}
export default function PieGraph({
  title,
  subtitle,
  data,
  onExport,
}: {
  title: string;
  subtitle: string;
  data: Record<string, PieGraphItem[]>;
  onExport?: () => Promise<boolean>;
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton onExport={onExport} className="m-2" />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className={`grid grid-cols-1 lg:grid-cols-${Object.values(data).length} lg:gap-4`}>
          {_map(data, (items: PieGraphItem[], key: string) => {
            const total = _sumBy(items, (item) => item.value);
            const orderedItems = _orderBy(items, ['value'], 'desc');

            const data = {
              labels: orderedItems.map((v) => v.label),
              datasets: [
                {
                  data: orderedItems.map((v) => v.value),
                  backgroundColor: orderedItems.map((v, ind) => getColor(ind)),
                  hoverOffset: 10,
                },
              ],
            };

            const options: ChartOptions<'doughnut'> = {
              cutout: '70%',
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function (context: TooltipItem<keyof ChartTypeRegistry>) {
                      const value = valueFormatter(Number(context.raw as number));
                      return value;
                    },
                  },
                },
              },
            };

            return (
              <div className="w-full max-w-lg mx-auto" key={key}>
                <Doughnut key={key} data={data} options={options} plugins={[centerTextPlugin]} />
                <h4 className="text-center font-semibold mt-5">{key}</h4>
                <ul className="tremor-List-root w-full divide-y divide-tremor-border text-tremor-content dark:divide-dark-tremor-border dark:text-dark-tremor-content">
                  {orderedItems.map((item) => {
                    return (
                      <li
                        key={item.label}
                        className="tremor-ListItem-root w-full flex justify-between text-tremor-default py-2 space-x-6"
                      >
                        <div className="space-x-2.5">
                          <span className="bg-cyan-500" aria-hidden="true"></span>
                          <span className="">{item.label}</span>
                        </div>
                        <div className="space-x-2">
                          <span className="">{formatNumber(item.value, { prefix: '' })}</span>
                          <span className="">{formatNumber((item.value / total) * 100, { suffix: '%' })}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
