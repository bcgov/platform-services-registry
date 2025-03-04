import Histogram from '@/components/analytics/Histogram';
import { downloadPrivateCloudRequestsDecisionTime } from '@/services/backend/analytics/private-cloud';
import { AnalyticsPrivateCloudResponse } from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function RequestsDecisionTime({
  snap,
  data,
}: {
  snap: typeof pageState;
  data: AnalyticsPrivateCloudResponse;
}) {
  return (
    <Histogram
      index="time"
      title="Request decision time frequency (%)"
      chartData={data.requestDecisionTime}
      categories={['Percentage']}
      colors={['indigo']}
      onExport={async () => downloadPrivateCloudRequestsDecisionTime({ data: { ...snap } })}
    />
  );
}
