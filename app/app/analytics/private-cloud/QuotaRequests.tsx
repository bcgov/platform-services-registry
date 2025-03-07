import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudQuotaChangeRequests } from '@/services/backend/analytics/private-cloud';
import { QuotaChange } from '@/types/analytics-private';
import { pageState } from './state';

export default function QuotaRequests({ data }: { data: QuotaChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <CombinedAreaGraph
      title="Quota requests over time"
      subtitle="This graph shows edit requests where a quota change was requested and the request decision"
      chartData={data}
      categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
      colors={['indigo', 'green', 'red']}
      onExport={async () => downloadPrivateCloudQuotaChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
