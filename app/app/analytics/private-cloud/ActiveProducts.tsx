import { useSnapshot } from 'valtio';
import LineGraph from '@/components/analytics/LineGraph';
import { clusters } from '@/constants';
import { downloadPrivateCloudActiveProducts } from '@/services/backend/analytics/private-cloud';
import { ActiveProduct } from '@/types/analytics';
import { pageState } from './state';

export default function ActiveProducts({ data }: { data: ActiveProduct[] }) {
  const pageSnapshot = useSnapshot(pageState);
  return (
    <LineGraph
      index="date"
      title="Active Products"
      subtitle="This graph shows the cumulative total of products provisioned through the registry"
      chartData={data}
      categories={['All Clusters'].concat(pageSnapshot.clusters?.length ? pageSnapshot.clusters : clusters)}
      onExport={() => downloadPrivateCloudActiveProducts({ data: { ...pageSnapshot } })}
    />
  );
}
