import LineGraph from '@/components/analytics/LineGraph';
import { clusters } from '@/constants';
import { downloadPrivateCloudActiveProducts } from '@/services/backend/analytics/private-cloud';
import { AnalyticsPrivateCloudResponse } from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function ActiveProducts({
  snap,
  data,
}: {
  snap: typeof pageState;
  data: AnalyticsPrivateCloudResponse;
}) {
  return (
    <LineGraph
      index="date"
      title="Active Products"
      subtitle="This graph shows the cumulative total of products provisioned through the registry"
      chartData={data.activeProducts}
      categories={['All Clusters'].concat(snap.clusters?.length ? snap.clusters : clusters)}
      onExport={async () => downloadPrivateCloudActiveProducts({ data: { ...snap } })}
    />
  );
}
