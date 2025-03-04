import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudAllRequests } from '@/services/backend/analytics/private-cloud';
import { AnalyticsPrivateCloudResponse } from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function AllRequests({ snap, data }: { snap: typeof pageState; data: AnalyticsPrivateCloudResponse }) {
  return (
    <CombinedAreaGraph
      title="Requests over time"
      subtitle="This graph shows the number of requests over time for each request type"
      chartData={data.allRequests}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      colors={['indigo', 'yellow', 'green', 'red']}
      onExport={async () => downloadPrivateCloudAllRequests({ data: { ...snap } })}
    />
  );
}
