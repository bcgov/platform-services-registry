import { formatDate } from 'date-fns';
import { MonthlyCost } from '@/types/private-cloud';
import { formatCurrency } from '@/utils/js';
import { TableDataSummaryBody } from '@/validation-schemas';

export default function TableSummary(data: MonthlyCost) {
  const tableDataSummary: TableDataSummaryBody[] = data.items.map((item, _) => ({
    'Date Range': (
      <>
        {' '}
        {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash; {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}{' '}
        {item.isArchived && (
          <span className="ml-2 inline-block rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            Archived
          </span>
        )}
        {item.isProjected && (
          <span className="ml-2 inline-block rounded bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
            Projected
          </span>
        )}
      </>
    ),
    'CPU (cores)': item.total.cpu.value.toString(),
    'Storage (GIB)': item.total.storage.value.toString(),
    'CPU Cost': formatCurrency(item.total.cpu.cost).toString(),
    'Storage Cost': formatCurrency(item.total.storage.cost).toString(),
    'Total Cost': formatCurrency(item.total.subtotal.cost).toString(),
  }));
  return tableDataSummary;
}
