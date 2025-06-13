import { Card, Title, Subtitle } from '@tremor/react';
import _map from 'lodash-es/map';
import _orderBy from 'lodash-es/orderBy';
import _sum from 'lodash-es/sum';
import _sumBy from 'lodash-es/sumBy';
import DoughnutChart, { DoughnutChartDataItem } from '@/components/generic/charts/DoughnutChart';
import { formatNumber } from '@/utils/js';
import ExportButton from '../buttons/ExportButton';

export default function DoughnutChartCard({
  title,
  subtitle,
  data,
  onExport,
}: {
  title: string;
  subtitle: string;
  data: Record<string, DoughnutChartDataItem[]>;
  onExport?: () => Promise<boolean>;
}) {
  return (
    <div className="flex flex-col items-end">
      <ExportButton onExport={onExport} className="m-2" />
      <Card>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <div className={`grid grid-cols-1 lg:grid-cols-${Object.values(data).length} lg:gap-4`}>
          {_map(data, (items: DoughnutChartDataItem[], key: string) => {
            const total = _sumBy(items, (item) => item.value);
            const orderedItems = _orderBy(items, ['value'], 'desc');

            return (
              <div className="w-full max-w-lg mx-auto" key={key}>
                <DoughnutChart key={key} data={orderedItems} />
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
