import { getPeriodCostDetailTableDataRow } from '@/helpers/private-cloud';
import { PeriodCosts } from '@/types/private-cloud';
import { formatDate, getMonthNameFromNumber } from '@/utils/js/date';
import { formatCurrency, formatNumber } from '@/utils/js/number';

export default function QuarterlyCostTable({ data }: { data: PeriodCosts }) {
  const monthlyCost = getPeriodCostDetailTableDataRow(data);
  const currenTotalCost = data.currentTotal ?? 0;

  return (
    <>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2 border-b">Date Range</th>
            <th className="text-right p-2 border-b">CPU (cores)</th>
            <th className="text-right p-2 border-b">Storage (GiB)</th>
            <th className="text-right p-2 border-b">CPU Unit Price (year)</th>
            <th className="text-right p-2 border-b">Storage Unit Price (year)</th>
            <th className="text-right p-2 border-b">CPU Cost</th>
            <th className="text-right p-2 border-b">Storage Cost</th>
            <th className="text-right p-2 border-b">Total Cost</th>
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
                <td className="p-2 border-b text-right">
                  {formatNumber(item.total.cpu.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatNumber(item.total.storage.value, { decimals: 2, keepDecimals: true, zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatCurrency(item.cpuPricePerYear, { zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatCurrency(item.storagePricePerYear, { zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatCurrency(item.total.cpu.cost, { zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatCurrency(item.total.storage.cost, { zeroAsEmpty: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {formatCurrency(item.total.subtotal.cost, { zeroAsEmpty: true })}
                </td>
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
            <th className="text-right p-2 border-b">CPU (Cores)</th>
            <th className="text-right p-2 border-b">CPU Cost</th>
            <th className="text-right p-2 border-b">Storage (GiB)</th>
            <th className="text-right p-2 border-b">Storage Cost</th>
            <th className="text-right p-2 border-b">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.timeUnits.map((month, idx: number) => {
            const totalCost = data.timeDetails.cpuCostsToDate[idx] + data.timeDetails.storageCostsToDate[idx];
            return (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="p-2 border-b text-center">{getMonthNameFromNumber(month)}</td>
                <td className="p-2 border-b text-right">
                  {totalCost === 0
                    ? '-'
                    : formatNumber(data.timeDetails.cpuQuotasToDate[idx], { decimals: 2, keepDecimals: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {totalCost === 0 ? '-' : formatCurrency(data.timeDetails.cpuCostsToDate[idx])}
                </td>
                <td className="p-2 border-b text-right">
                  {totalCost === 0
                    ? '-'
                    : formatNumber(data.timeDetails.cpuQuotasToDate[idx], { decimals: 2, keepDecimals: true })}
                </td>
                <td className="p-2 border-b text-right">
                  {totalCost === 0 ? '-' : formatCurrency(data.timeDetails.storageCostsToDate[idx])}
                </td>
                <td className="p-2 border-b text-right">{totalCost === 0 ? '-' : formatCurrency(totalCost)}</td>
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
