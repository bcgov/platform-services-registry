import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudContactChangeRequests } from '@/services/backend/analytics/private-cloud';
import { ContactsChange } from '@/types/analytics';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function ContactChangeRequests({ data }: { data: ContactsChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <CombinedAreaGraph
      title="Contact change requests over time"
      subtitle={`This chart displays edit requests where contact changes were requested and the request decision from ${formatDate(
        pageSnapshot.dates?.[0] || data?.[0]?.date,
      )} to ${formatDate(pageSnapshot.dates?.[1] || new Date())}.`}
      chartData={data}
      categories={['Contact changes']}
      colors={['indigo']}
      onExport={() => downloadPrivateCloudContactChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
