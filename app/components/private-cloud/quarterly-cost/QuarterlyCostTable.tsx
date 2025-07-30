import { calculateTotalCost, getMonthlyCostData } from '@/constants';
import { PeriodCosts } from '@/types/private-cloud';
import { formatDate, getMonthNameFromNumber } from '@/utils/js/date';
import { formatCurrency } from '@/utils/js/number';

export default function QuarterlyCostTable({ data }: { data: PeriodCosts }) {
  const monthlyCost = getMonthlyCostData(data);
  const currenTotalCost = calculateTotalCost(monthlyCost);
  return (
    <>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2 border-b">Date Range</th>
            <th className="text-center p-2 border-b">CPU (cores)</th>
            <th className="text-center p-2 border-b">Storage (GiB)</th>
            <th className="text-center p-2 border-b">CPU Cost</th>
            <th className="text-center p-2 border-b">Storage Cost</th>
            <th className="text-center p-2 border-b">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length > 0 ? (
            data.items.map((item, idx: number) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="p-2 border-b text-left">
                  {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash;{' '}
                  {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}{' '}
                  {item.isArchived && (
                    <span className="ml-2 inline-block rounded-sm bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      Archived
                    </span>
                  )}
                  {item.isProjected && (
                    <span className="ml-2 inline-block rounded-sm bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                      Projected
                    </span>
                  )}
                </td>
                <td className="p-2 border-b text-left">{item.total.cpu.value}</td>
                <td className="p-2 border-b text-center">{item.total.storage.value}</td>
                <td className="p-2 border-b text-center">{formatCurrency(item.total.cpu.cost)}</td>
                <td className="p-2 border-b text-center">{formatCurrency(item.total.storage.cost)}</td>
                <td className="p-2 border-b text-center">{formatCurrency(item.total.subtotal.cost)}</td>
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
            <th className="text-center p-2 border-b">Month</th>
            <th className="text-center p-2 border-b">CPU (Cores)</th>
            <th className="text-center p-2 border-b">CPU Cost</th>
            <th className="text-center p-2 border-b">Storage (GiB)</th>
            <th className="text-center p-2 border-b">Storage Cost</th>
            <th className="text-center p-2 border-b">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.timeUnits.map((month, idx: number) => {
            const totalCost = data.timeDetails.cpuToDate[idx] + data.timeDetails.storageToDate[idx];
            return (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="p-2 border-b text-center">{getMonthNameFromNumber(month)}</td>
                <td className="p-2 border-b text-center">
                  {/* {totalCost === 0 ? 'N/A' : data.discreteResourceValues[month].cpu} */}
                </td>
                <td className="p-2 border-b text-center">
                  {totalCost === 0 ? 'N/A' : formatCurrency(data.timeDetails.cpuToDate[idx])}
                </td>
                <td className="p-2 border-b text-center">
                  {/* {totalCost === 0 ? 'N/A' : data.discreteResourceValues[month].storage} */}
                </td>
                <td className="p-2 border-b text-center">
                  {totalCost === 0 ? 'N/A' : formatCurrency(data.timeDetails.storageToDate[idx])}
                </td>
                <td className="p-2 border-b text-center">{totalCost === 0 ? 'N/A' : formatCurrency(totalCost)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} />
            <td colSpan={1} className="p-2 border-b text-center">
              <strong>Current total cost for {data.billingPeriod}</strong>
            </td>
            <td colSpan={1} className="p-2 border-b text-center">
              <strong>{formatCurrency(currenTotalCost)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}
