'use client';

import { Box, LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import FormDateRangePicker from '@/components/generic/select/FormDateRangePicker';
import FormUserPicker from '@/components/generic/select/FormUserPicker';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchLogins } from '@/services/backend/analytics/general';
import { downloadEvents } from '@/services/backend/events';
import { pageState } from './state';

const analyticsDashboard = createClientPage({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  fallbackUrl: '/login?callbackUrl=/home',
});

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : 'N/A');

export default analyticsDashboard(() => {
  const snap = useSnapshot(pageState);
  const { data, isLoading } = useQuery({
    queryKey: ['logins', snap.dates, snap.userId],
    queryFn: () => searchLogins(snap),
  });

  return (
    <div className="">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">General Analytics</h1>
      <div className="flex flex-wrap items-center gap-x-4 mt-12">
        <FormDateRangePicker
          value={(snap.dates?.map((d) => (d ? new Date(d) : null)) as [Date | null, Date | null]) ?? [null, null]}
          label="Date Range"
          onChange={(dates) => {
            pageState.dates = dates.filter((value) => !!value).map((v) => v.toISOString());
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
        {isLoading ? (
          <Box pos="relative" className="min-h-96">
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            {!isLoading}
          </Box>
        ) : (
          <CombinedAreaGraph
            title="Daily User Login Events"
            subtitle={`This chart displays the number of login events per day from ${formatDate(
              snap.dates?.[0],
            )} to ${formatDate(snap.dates?.[1])}.`}
            chartData={data}
            categories={['Logins']}
            colors={['indigo']}
            onExport={async () => {
              const result = await downloadEvents(snap);
              return result;
            }}
          />
        )}
      </div>
    </div>
  );
});
