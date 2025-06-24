import { useSnapshot } from 'valtio';
import BarChartCard from '@/components/analytics/BarChartCard';
import { downloadPublicCloudRequestsDecisionTime } from '@/services/backend/analytics/public-cloud';
import { RequestDecisionTime } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function RequestsDecisionTime({ data }: { data: RequestDecisionTime[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? new Date('2024-01-01T00:00:00.000Z');
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <BarChartCard
      index="time"
      title="Request decision time frequency (%)"
      subtitle={`This chart displays the frequency of request decision times (%) for  products created from ${formatDate(
        startDate,
        'MMMM d, yyyy',
      )} to ${formatDate(endDate, 'MMMM d, yyyy')}.`}
      chartData={data}
      categories={['Percentage']}
      valueFormatter={(val) => `${val.toFixed(2)}%`}
      onExport={async () => downloadPublicCloudRequestsDecisionTime({ data: { ...pageSnapshot } })}
    />
  );
}
