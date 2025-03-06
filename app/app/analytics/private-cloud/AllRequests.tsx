import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudAllRequests } from '@/services/backend/analytics/private-cloud';
import type { AllRequests } from '@/types/analytics';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function AllRequests({ data }: { data: AllRequests[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <CombinedAreaGraph
      title="Requests over time"
      subtitle={`This chart displays the number of requests created over time for each request type from ${formatDate(
        pageSnapshot.dates?.[0] || data?.[0]?.date,
      )} to ${formatDate(pageSnapshot.dates?.[1] || new Date())}.`}
      chartData={data}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      colors={['indigo', 'yellow', 'green', 'red']}
      onExport={() => downloadPrivateCloudAllRequests({ data: { ...pageSnapshot } })}
    />
  );
}
