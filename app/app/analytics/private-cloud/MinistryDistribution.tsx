import { useSnapshot } from 'valtio';
import MultipleDoughnutChartCard from '@/components/analytics/MultipleDoughnutChartCard';
import { clustersWithoutDR } from '@/constants';
import { mapClusterData, transformMinistryData } from '@/helpers/ministry-data';
import { downloadPrivateCloudMinistryDistribution } from '@/services/backend/analytics/private-cloud';
import type { MinistryDistribution } from '@/types/analytics-private';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function MinistryDistribution({ data }: { data: MinistryDistribution[][] }) {
  const pageSnapshot = useSnapshot(pageState);
  const selectedClusters = pageSnapshot.clusters?.length ? pageSnapshot.clusters : clustersWithoutDR;
  const allClusterData = transformMinistryData(data[0]);
  const startDate = pageSnapshot.dates?.[0] ?? new Date('2023-04-01T00:00:00.000Z');
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  const mappedClusterData = mapClusterData(selectedClusters, data);

  const pieChartData: Record<string, { label: string; value: number }[]> = {
    All: allClusterData,
    ...mappedClusterData,
  };

  return (
    <MultipleDoughnutChartCard
      onExport={() => downloadPrivateCloudMinistryDistribution({ data: { ...pageSnapshot } })}
      title="Ministry per Cluster"
      subtitle={`This chart displays the cluster distributions by ministries for products created from ${formatDate(
        startDate,
        'MMMM d, yyyy',
      )} to ${formatDate(endDate, 'MMMM d, yyyy')}.`}
      data={pieChartData}
    />
  );
}
