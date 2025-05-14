import { MonthlyCost } from '@/types/private-cloud';
import { formatDate } from '@/utils/js/date';
import { formatCurrency } from '@/utils/js/number';

export default function MonthlyCostTable({ data }: { data: Pick<MonthlyCost, 'items' | 'days' | 'dayDetails'> }) {
  return (
    <>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2 border-b">Date Range</th>
            <th className="text-right p-2 border-b">CPU (cores)</th>
            <th className="text-right p-2 border-b">Storage (GiB)</th>
            <th className="text-right p-2 border-b">CPU Cost</th>
            <th className="text-right p-2 border-b">Storage Cost</th>
            <th className="text-right p-2 border-b">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length > 0 ? (
            data.items.map((item, idx: number) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="p-2 border-b align-top">
                  {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash;{' '}
                  {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}{' '}
                  {!item.isPast && (
                    <span className="ml-2 inline-block rounded bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                      Projected
                    </span>
                  )}
                </td>
                <td className="p-2 border-b text-right align-top">{item.total.cpu.value}</td>
                <td className="p-2 border-b text-right align-top">{item.total.storage.value}</td>
                <td className="p-2 border-b text-right align-top">{formatCurrency(item.total.cpu.cost)}</td>
                <td className="p-2 border-b text-right align-top">{formatCurrency(item.total.storage.cost)}</td>
                <td className="p-2 border-b text-right align-top">{formatCurrency(item.total.subtotal.cost)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-2 border-b italic text-center">
                No data available for the selected month.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <table className="w-full text-sm border-collapse mt-6">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2 border-b">Days</th>
            <th className="text-right p-2 border-b">CPU Cost</th>
            <th className="text-right p-2 border-b">Storage Cost</th>
            <th className="text-right p-2 border-b">CPU Cost (Projected)</th>
            <th className="text-right p-2 border-b">Storage Cost (Projected)</th>
            <th className="text-right p-2 border-b">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.days.map((day, idx: number) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
              <td className="p-2 border-b align-top">{day}</td>
              <td className="p-2 border-b text-right align-top">{formatCurrency(data.dayDetails.cpuToDate[idx])}</td>
              <td className="p-2 border-b text-right align-top">
                {formatCurrency(data.dayDetails.storageToDate[idx])}
              </td>
              <td className="p-2 border-b text-right align-top">
                {formatCurrency(data.dayDetails.cpuToProjected[idx])}
              </td>
              <td className="p-2 border-b text-right align-top">
                {formatCurrency(data.dayDetails.storageToProjected[idx])}
              </td>
              <td className="p-2 border-b text-right align-top">
                {formatCurrency(
                  data.dayDetails.cpuToDate[idx] +
                    data.dayDetails.storageToDate[idx] +
                    data.dayDetails.cpuToProjected[idx] +
                    data.dayDetails.storageToProjected[idx],
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
