import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudContactChangeRequests } from '@/services/backend/analytics/private-cloud';
import { ContactsChange } from '@/types/analytics-private';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function ContactChangeRequests({ data }: { data: ContactsChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <CombinedAreaGraph
      index="date"
      title="Contact change requests over time"
      subtitle={`This chart displays edit requests where contact changes were requested and the request decision from ${formatDate(
        startDate,
      )} to ${formatDate(endDate)}.`}
      chartData={data}
      categories={['Contact changes']}
      onExport={() => downloadPrivateCloudContactChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
