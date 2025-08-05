import { PeriodCostItem } from '@/types/private-cloud';
import { formatDate } from '@/utils/js/date';

export default function CostStatusBadge({ item }: { item: PeriodCostItem }) {
  return (
    <>
      {formatDate(item.startDate, 'yyyy-MM-dd HH:mm')} &ndash; {formatDate(item.endDate, 'yyyy-MM-dd HH:mm')}{' '}
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
    </>
  );
}
