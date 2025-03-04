import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudContactChangeRequests } from '@/services/backend/analytics/private-cloud';
import { AnalyticsPrivateCloudResponse } from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function ContactChangeRequests({
  snap,
  data,
}: {
  snap: typeof pageState;
  data: AnalyticsPrivateCloudResponse;
}) {
  return (
    <CombinedAreaGraph
      title="Contact change requests over time"
      subtitle="This graph shows edit requests where contact change(s) was requested and the request decision"
      chartData={data.contactsChange}
      categories={['Contact changes']}
      colors={['indigo']}
      onExport={async () => downloadPrivateCloudContactChangeRequests({ data: { ...snap } })}
    />
  );
}
