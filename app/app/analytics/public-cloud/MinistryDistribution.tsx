import { useSnapshot } from 'valtio';
import PieGraph from '@/components/analytics/PieGraph';
import { providers } from '@/constants';
import { mapProviderData, transformMinistryData } from '@/helpers/ministry-data';
import { downloadPublicCloudMinistryDistribution } from '@/services/backend/analytics/public-cloud';
import type { MinistryDistribution } from '@/types/analytics-public';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

export default function MinistryDistribution({ data }: { data: MinistryDistribution[][] }) {
  const pageSnapshot = useSnapshot(pageState);
  const selectedProviders = pageSnapshot.providers?.length ? pageSnapshot.providers : providers;
  const allProviderData = transformMinistryData(data[0]);
  const startDate = pageSnapshot.dates?.[0] ?? new Date('2024-01-01T00:00:00.000Z');
  const endDate = pageSnapshot.dates?.[1] ?? new Date();
  const mappedProviderData = mapProviderData(selectedProviders, data);

  const pieChartData: Record<string, { label: string; value: number }[]> = {
    All: allProviderData,
    ...mappedProviderData,
  };

  return (
    <PieGraph
      onExport={async () => downloadPublicCloudMinistryDistribution({ data: { ...pageSnapshot } })}
      title="Ministry per Provider"
      subtitle={`This chart displays the cluster distributions by ministries for products created from ${formatDate(
        startDate,
      )} to ${formatDate(endDate)}.`}
      data={pieChartData}
    />
  );
}
