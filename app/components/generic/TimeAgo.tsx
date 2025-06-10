import { Tooltip } from '@mantine/core';
import { formatDate, timeAgo } from '@/utils/js';

export default function TimeAgo({ date }: { date?: Date | string | null }) {
  if (!date) return null;

  return (
    <Tooltip label={formatDate(date)} position="left">
      <div className="text-xs mt-1">{timeAgo(date)}</div>
    </Tooltip>
  );
}
