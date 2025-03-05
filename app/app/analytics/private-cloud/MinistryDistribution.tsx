import { useSnapshot } from 'valtio';
import PieGraph from '@/components/analytics/PieGraph';
import { clusters } from '@/constants';
import { mapClusterData, transformMinistryData } from '@/helpers/ministry-data';
import { downloadPrivateCloudMinistryDistribution } from '@/services/backend/analytics/private-cloud';
import type { MinistryDistribution } from '@/types/analytics';
import { pageState } from './state';

export default function MinistryDistribution({ data }: { data: MinistryDistribution[][] }) {
  const pageSnapshot = useSnapshot(pageState);
  const selectedClusters = pageSnapshot.clusters?.length ? pageSnapshot.clusters : clusters;
  const allClusterData = transformMinistryData(data[0]);

  const mappedClusterData = mapClusterData(selectedClusters, data);

  const pieChartData: Record<string, { label: string; value: number }[]> = {
    All: allClusterData,
    ...mappedClusterData,
  };

  return (
    <PieGraph
      onExport={() => downloadPrivateCloudMinistryDistribution({ data: { ...pageSnapshot } })}
      title="Ministry per Cluster"
      subtitle="This graph shows the cluster distributions by ministries"
      data={pieChartData}
    />
  );
}
