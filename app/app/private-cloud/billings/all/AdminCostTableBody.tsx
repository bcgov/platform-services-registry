import { monthNames } from '@/constants';
import { MonthlyProductCostData } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';

export default function AdminCostTableBody({
  data,
  totalCost,
  totalCount,
  yearMonth,
  page,
  pageSize,
}: {
  data: MonthlyProductCostData[];
  totalCost: number;
  totalCount: number;
  yearMonth: string;
  page?: number;
  pageSize?: number;
}) {
  const [year, month] = yearMonth.split('-');

  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-[300px] w-full border">
        <span className="italic">No billing data available</span>
      </div>
    );

  const header = (
    <div className="flex justify-between items-center my-3">
      <h1 className="text-xl font-semibold flex-1 text-center">
        Billing Information for {monthNames[parseInt(month) - 1]}, {year}
      </h1>
      {pageSize && (
        <div className="text-sm text-gray-700 pr-5">
          | Page {page} of {Math.ceil(totalCount / pageSize)}
        </div>
      )}
    </div>
  );

  const rows = data.map((item) => (
    <tr key={item.product.licencePlate} className="even:bg-gray-50">
      <td className="p-2 border-b text-left align-top">{item.product.name}</td>
      <td className="p-2 border-b text-left align-top">{formatCurrency(item.cost)}</td>
    </tr>
  ));

  const footer = (
    <tr>
      <td className="p-2 border-b text-left align-top font-semibold">Total Cost</td>
      <td className="p-2 border-b text-left align-top font-semibold">{formatCurrency(totalCost)}</td>
    </tr>
  );

  return (
    <>
      {header}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2 border-b">Product Name</th>
            <th className="text-left p-2 border-b">Cost</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
        <tfoot>{footer}</tfoot>
      </table>
    </>
  );
}
