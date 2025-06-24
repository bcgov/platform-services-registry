import { useSnapshot } from 'valtio';
import LineChartCard from '@/components/analytics/LineChartCard';
import { providers } from '@/constants';
import { downloadPublicCloudActiveProducts } from '@/services/backend/analytics/public-cloud';
import { ActiveProduct } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function ActiveProducts({ data }: { data: ActiveProduct[] }) {
  const pageSnapshot = useSnapshot(pageState);
  const startDate = pageSnapshot.dates?.[0] ?? data?.[0]?.date;
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  return (
    <LineChartCard
      index="date"
      title="Active Products"
      subtitle={`This chart displays the cumulative number of products created from ${formatDate(
        startDate,
        'MMMM d, yyyy',
      )} to ${formatDate(endDate, 'MMMM d, yyyy')}.`}
      chartData={data}
      categories={['All Providers'].concat(pageSnapshot.providers?.length ? pageSnapshot.providers : providers)}
      onExport={async () => downloadPublicCloudActiveProducts({ data: { ...pageSnapshot } })}
    />
  );
}
