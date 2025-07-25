import { useSnapshot } from 'valtio';
import LineChartCard from '@/components/analytics/LineChartCard';
import { downloadPublicCloudAllRequests } from '@/services/backend/analytics/public-cloud';
import type { AllRequests } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function AllRequests({ data }: { data: AllRequests[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <LineChartCard
      index="date"
      title="Requests over time"
      subtitle={`This chart displays the number of requests created over time for each request type from ${formatDate(
        startDate,
        'MMMM d, yyyy',
      )} to ${formatDate(endDate, 'MMMM d, yyyy')}.`}
      chartData={data}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      onExport={async () => downloadPublicCloudAllRequests({ data: { ...pageSnapshot } })}
    />
  );
}
