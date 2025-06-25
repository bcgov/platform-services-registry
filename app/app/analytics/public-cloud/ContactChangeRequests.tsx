import { useSnapshot } from 'valtio';
import LineChartCard from '@/components/analytics/LineChartCard';
import { downloadPublicCloudContactChangeRequests } from '@/services/backend/analytics/public-cloud';
import { ContactsChange } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function ContactChangeRequests({ data }: { data: ContactsChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <LineChartCard
      index="date"
      title="Contact change requests over time"
      subtitle={`This chart displays edit requests where contact changes were requested and the request decision from ${formatDate(
        startDate,
        'MMMM d, yyyy',
      )} to ${formatDate(endDate, 'MMMM d, yyyy')}.`}
      chartData={data}
      categories={['Contact changes']}
      onExport={async () => downloadPublicCloudContactChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
