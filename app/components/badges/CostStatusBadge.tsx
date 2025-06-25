import { formatDate } from 'date-fns';
import { PeriodicCostMetric } from '@/types/private-cloud';

export default function CostStatusBadge(item: PeriodicCostMetric) {
  return (
    <>
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
  );
}
