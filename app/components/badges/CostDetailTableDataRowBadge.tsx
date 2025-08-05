import { CostDetailTableDataRow } from '@/types/private-cloud';

export default function CostDetailTableDataRowBadge({
  item,
  forecast = false,
}: {
  item: CostDetailTableDataRow;
  forecast: boolean;
}) {
  return (
    <>
      <span>{item.timeUnit}</span>
      {forecast && !item.past && (
        <span className="ml-2 inline-block rounded-sm bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
          Projected
        </span>
      )}
    </>
  );
}
