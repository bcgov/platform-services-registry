import { Card } from '@mantine/core';
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
    <div>
      <div className="text-right">
        <ExportButton onExport={onExport} className="m-2" />
      </div>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <h2>{title}</h2>
        <h5 className="text-gray-600">{subtitle}</h5>
        <div className={`grid grid-cols-1 lg:grid-cols-${Object.keys(data).length} lg:gap-4`}>
          {_map(data, (items: DoughnutChartDataItem[], key: string) => {
            const total = _sumBy(items, (item) => item.value);
            const orderedItems = _orderBy(items, ['value'], 'desc');

            return (
              <div key={key}>
                <DoughnutChart key={key} data={orderedItems} />
                <h4 className="text-center font-semibold mt-5">{key}</h4>
                <table>
                  <tbody>
                    {orderedItems.map((item) => {
                      return (
                        <tr className="text-gray-700" key={item.value}>
                          <td className="py-1">{item.label}</td>
                          <td className="text-right px-3">{formatNumber(item.value, { prefix: '' })}</td>
                          <td className="text-right">{formatNumber((item.value / total) * 100, { suffix: '%' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
