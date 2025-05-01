'use client';

import { YearlyCostDataWithMonthName } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export interface TableProps {
  data: YearlyCostDataWithMonthName[];
  currentYear: string;
}

export default function YearlyCostTable({ data, currentYear }: TableProps) {
  const rows = data.length ? (
    data.map((resource, index) => (
      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-500 border-r border-gray-200">
          {resource.month} {currentYear}
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-gray-500 border-r border-gray-200">
          {formatCurrency(resource.cpuCost)}
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-gray-500 border-r border-gray-200">
          {formatCurrency(resource.storageCost)}
        </td>
        <td className="px-6 py-2 whitespace-nowrap text-gray-700">{formatCurrency(resource.totalCost)}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={4} className="px-6 py-2 whitespace-nowrap text-sm italic text-gray-500 text-center">
        No Cost History Found
      </td>
    </tr>
  );

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      {/* Scrollable container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 border-x border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-2 text-left text-xs text-gray-600 font-semibold uppercase tracking-wider border-r border-gray-200 sticky top-0 bg-gray-50"
              >
                Month
              </th>
              <th
                scope="col"
                className="px-6 py-2 text-left text-xs text-gray-600 font-semibold uppercase tracking-wider border-r border-gray-200 sticky top-0 bg-gray-50"
              >
                CPU Usage
              </th>
              <th
                scope="col"
                className="px-6 py-2 text-left text-xs text-gray-600 font-semibold uppercase tracking-wider border-r border-gray-200 sticky top-0 bg-gray-50"
              >
                Storage Usage
              </th>
              <th
                scope="col"
                className="px-6 py-2 text-left text-xs text-gray-600 font-semibold uppercase tracking-wider sticky top-0 bg-gray-50"
              >
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{rows}</tbody>
        </table>
      </div>
    </div>
  );
}
