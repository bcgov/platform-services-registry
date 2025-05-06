import { monthNames } from '@/constants';
import { ProductInformation } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export default function TableBody({
  billings,
  totalCost,
  totalCount,
  yearMonth,
  page,
}: {
  billings: ProductInformation[];
  totalCost: number;
  totalCount: number;
  yearMonth: string;
  page: number;
}) {
  const yyyyMM = yearMonth.split('-');
  const year = yyyyMM[0];
  const month = yyyyMM[1];

  const body =
    billings.length > 0 ? (
      billings.map((item, idx) => (
        <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
          <td className="p-2 border-b text-left align-top">{item.product.name}</td>
          <td className="p-2 border-b text-left align-top">{formatCurrency(item.cost)}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={6} className="p-2 border-b italic text-center">
          No billing information found
        </td>
      </tr>
    );

  const footer = billings.length && (
    <tr className="bg-gray-100">
      <td className="p-2 border-b text-left align-top font-semibold">Total Cost</td>
      <td className="p-2 border-b text-left align-top font-semibold">{formatCurrency(totalCost)}</td>
    </tr>
  );

  return (
    <div className="overflow-hidden ring-black">
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center my-3">
          <h1 className="text-xl font-semibold flex-1 text-center">
            Billing Information for {monthNames[parseInt(month) - 1]}, {year}
          </h1>
          {billings.length > 0 && (
            <div className="text-sm text-gray-700 pr-5">
              | Page {page} of {Math.ceil(totalCount / 10)}
            </div>
          )}
        </div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-200">
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="text-left p-2 border-b">Product Name</th>
              <th className="text-left p-2 border-b">Cost</th>
            </tr>
          </thead>
          <tbody className="text-left p-2 border-b">{body}</tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  );
}
