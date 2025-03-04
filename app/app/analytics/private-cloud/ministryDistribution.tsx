import PieGraph from '@/components/analytics/PieGraph';
import { clusters } from '@/constants';
import { mapClusterData, transformMinistryData } from '@/helpers/ministry-data';
import {
  AnalyticsPrivateCloudResponse,
  downloadPrivateCloudMinistryDistribution,
} from '@/services/backend/analytics/private-cloud';
import { pageState } from './state';

export default function MinistryDistribution({
  snap,
  data,
}: {
  snap: typeof pageState;
  data: AnalyticsPrivateCloudResponse;
}) {
  const selectedClusters = snap.clusters?.length ? snap.clusters : clusters;
  const allClusterData = transformMinistryData(data.ministryDistributionData[0]);

  const mappedClusterData = mapClusterData(selectedClusters, data.ministryDistributionData);

  const pieChartData: Record<string, { label: string; value: number }[]> = {
    All: allClusterData,
    ...mappedClusterData,
  };

  return (
    <PieGraph
      onExport={async () => downloadPrivateCloudMinistryDistribution({ data: { ...snap } })}
      title="Ministry per Cluster"
      subtitle="This graph shows the cluster distributions by ministries"
      data={pieChartData}
    />
  );
}
