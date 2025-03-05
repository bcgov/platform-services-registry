import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudContactChangeRequests } from '@/services/backend/analytics/private-cloud';
import { ContactsChange } from '@/types/analytics';
import { pageState } from './state';

export default function ContactChangeRequests({ data }: { data: ContactsChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <CombinedAreaGraph
      title="Contact change requests over time"
      subtitle="This graph shows edit requests where contact change(s) was requested and the request decision"
      chartData={data}
      categories={['Contact changes']}
      colors={['indigo']}
      onExport={async () => downloadPrivateCloudContactChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
