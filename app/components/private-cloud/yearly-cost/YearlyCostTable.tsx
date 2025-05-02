'use client';

import { YearlyCostDataWithMonthName } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export default function YearlyCostTable({
  data,
  currentYear,
}: {
  data: YearlyCostDataWithMonthName[];
  currentYear: string;
}) {
  const rows =
    data.length > 0 ? (
      data.map((item, idx: number) => (
        <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
          <td className="p-2 border-b text-right align-top">
            {item.month} {currentYear}
          </td>
          <td className="p-2 border-b text-right align-top">{formatCurrency(item.cpuCost)}</td>
          <td className="p-2 border-b text-right align-top">{formatCurrency(item.storageCost)}</td>
          <td className="p-2 border-b text-right align-top">{formatCurrency(item.totalCost)}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={6} className="p-2 border-b italic text-center">
          No data available for the selected year.
        </td>
      </tr>
    );

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th className="text-right p-2 border-b">Month</th>
          <th className="text-right p-2 border-b">CPU Cost</th>
          <th className="text-right p-2 border-b">Storage Cost</th>
          <th className="text-right p-2 border-b">Total Cost</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
