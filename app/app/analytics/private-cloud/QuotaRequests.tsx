import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import { downloadPrivateCloudQuotaChangeRequests } from '@/services/backend/analytics/private-cloud';
import { QuotaChange } from '@/types/analytics-private';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function QuotaRequests({ data }: { data: QuotaChange[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <CombinedAreaGraph
      title="Quota requests over time"
      subtitle={`This chart displays edit requests where a quota change was requested and the request decision from ${formatDate(
        startDate,
      )} to ${formatDate(endDate)}.`}
      chartData={data}
      categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
      colors={['indigo', 'green', 'red']}
      onExport={() => downloadPrivateCloudQuotaChangeRequests({ data: { ...pageSnapshot } })}
    />
  );
}
