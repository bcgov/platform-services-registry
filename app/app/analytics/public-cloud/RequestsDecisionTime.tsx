import { useSnapshot } from 'valtio';
import Histogram from '@/components/analytics/Histogram';
import { downloadPublicCloudRequestsDecisionTime } from '@/services/backend/analytics/public-cloud';
import { RequestDecisionTime } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function RequestsDecisionTime({ data }: { data: RequestDecisionTime[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? new Date('2024-01-01T00:00:00.000Z');
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <Histogram
      index="time"
      title="Request decision time frequency (%)"
      subtitle={`This chart displays the frequency of request decision times (%) for  products created from ${formatDate(
        startDate,
      )} to ${formatDate(endDate)}.`}
      chartData={data}
      categories={['Percentage']}
      colors={['indigo']}
      onExport={async () => downloadPublicCloudRequestsDecisionTime({ data: { ...pageSnapshot } })}
    />
  );
}
