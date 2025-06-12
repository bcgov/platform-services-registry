import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudAllRequests } from '@/services/backend/analytics/private-cloud';
import type { AllRequests } from '@/types/analytics-private';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function AllRequests({ data }: { data: AllRequests[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <CombinedAreaGraph
      index="date"
      title="Requests over time"
      subtitle={`This chart displays the number of requests created over time for each request type from ${formatDate(
        startDate,
      )} to ${formatDate(endDate)}.`}
      chartData={data}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      onExport={() => downloadPrivateCloudAllRequests({ data: { ...pageSnapshot } })}
    />
  );
}
