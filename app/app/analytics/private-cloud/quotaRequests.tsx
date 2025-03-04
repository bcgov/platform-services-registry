import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudQuotaChangeRequests } from '@/services/backend/analytics/private-cloud';
import { AnalyticsPrivateCloudResponse } from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function QuotaRequests({ snap, data }: { snap: typeof pageState; data: AnalyticsPrivateCloudResponse }) {
  return (
    <CombinedAreaGraph
      title="Quota requests over time"
      subtitle="This graph shows edit requests where a quota change was requested and the request decision"
      chartData={data.quotaChange}
      categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
      colors={['indigo', 'green', 'red']}
      onExport={async () => downloadPrivateCloudQuotaChangeRequests({ data: { ...snap } })}
    />
  );
}
