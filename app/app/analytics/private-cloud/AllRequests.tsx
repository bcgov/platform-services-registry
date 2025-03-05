import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudAllRequests } from '@/services/backend/analytics/private-cloud';
import type { AllRequests } from '@/types/analytics';
import { pageState } from './state';

export default function AllRequests({ data }: { data: AllRequests[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <CombinedAreaGraph
      title="Requests over time"
      subtitle="This graph shows the number of requests over time for each request type"
      chartData={data}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      colors={['indigo', 'yellow', 'green', 'red']}
      onExport={() => downloadPrivateCloudAllRequests({ data: { ...pageSnapshot } })}
    />
  );
}
