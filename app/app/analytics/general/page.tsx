'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import FormDateRangePicker from '@/components/generic/select/FormDateRangePicker';
import FormUserPicker from '@/components/generic/select/FormUserPicker';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getAnalyticsGeneralData, downloadAnalyticsGeneral } from '@/services/backend/analytics/general';
import { formatDate } from '@/utils/js/date';
import { pageState } from './state';

const analyticsDashboard = createClientPage({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default analyticsDashboard(() => {
  const snap = useSnapshot(pageState);

  const { data, isLoading } = useQuery({
    queryKey: ['logins', snap.dates, snap.userId],
    queryFn: () => getAnalyticsGeneralData({ dates: snap.dates, userId: snap.userId }),
  });

  return (
    <div className="">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">General Analytics</h1>
      <div className="flex flex-wrap items-center gap-x-4 mt-12">
        <FormDateRangePicker
          value={(snap.dates.map((d) => new Date(d)) as [Date | null, Date | null]) ?? [null, null]}
          label="Date Range"
          onChange={(dates) => {
            pageState.dates = dates.filter((v): v is Date => v !== null).map((v) => v.toISOString());
          }}
        />
        <FormUserPicker
          label="User"
          onChange={(user) => {
            pageState.userId = user?.id ?? '';
          }}
        />
      </div>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          isLoading={isLoading}
          title="Daily User Login Events"
          subtitle={`This chart displays the number of login events per day from ${formatDate(
            snap.dates?.[0] || data?.[0]?.date,
          )} to ${formatDate(snap.dates?.[1] || new Date())}.`}
          chartData={data}
          categories={['Logins']}
          colors={['indigo']}
          onExport={async () => {
            const result = await downloadAnalyticsGeneral({ dates: snap.dates, userId: snap.userId });
            return result;
          }}
        />
      </div>
    </div>
  );
});
