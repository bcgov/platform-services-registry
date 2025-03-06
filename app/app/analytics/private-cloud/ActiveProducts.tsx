import { useSnapshot } from 'valtio';
import LineGraph from '@/components/analytics/LineGraph';
import { clusters } from '@/constants';
import { downloadPrivateCloudActiveProducts } from '@/services/backend/analytics/private-cloud';
import { ActiveProduct } from '@/types/analytics';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function ActiveProducts({ data }: { data: ActiveProduct[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <LineGraph
      index="date"
      title="Active Products"
      subtitle={`This chart displays the cumulative number of products created from ${formatDate(
        pageSnapshot.dates?.[0] || data?.[0]?.date,
      )} to ${formatDate(pageSnapshot.dates?.[1] || new Date())}.`}
      chartData={data}
      categories={['All Clusters'].concat(pageSnapshot.clusters?.length ? pageSnapshot.clusters : clusters)}
      onExport={() => downloadPrivateCloudActiveProducts({ data: { ...pageSnapshot } })}
    />
  );
}
