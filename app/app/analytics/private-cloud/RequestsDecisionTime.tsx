import { useSnapshot } from 'valtio';
import Histogram from '@/components/analytics/Histogram';
import { downloadPrivateCloudRequestsDecisionTime } from '@/services/backend/analytics/private-cloud';
import { RequestDecisionTime } from '@/types/analytics-private';
import { pageState } from './state';

export default function RequestsDecisionTime({ data }: { data: RequestDecisionTime[] }) {
  const pageSnapshot = useSnapshot(pageState);

  return (
    <Histogram
      index="time"
      title="Request decision time frequency (%)"
      chartData={data}
      categories={['Percentage']}
      colors={['indigo']}
      onExport={async () => downloadPrivateCloudRequestsDecisionTime({ data: { ...pageSnapshot } })}
    />
  );
}
