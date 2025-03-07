'use client';

import { Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getAnalyticsPublicCloudData } from '@/services/backend/analytics/public-cloud';
import ActiveProducts from './ActiveProducts';
import AllRequests from './AllRequests';
import ContactChangeRequests from './ContactChangeRequests';
import FilterPanel from './FilterPanel';
import MinistryDistribution from './MinistryDistribution';
import RequestsDecisionTime from './RequestsDecisionTime';
import { pageState } from './state';

const analyticsPublicCloudDashboard = createClientPage({
  permissions: [GlobalPermissions.ViewPublicAnalytics],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default analyticsPublicCloudDashboard(() => {
  const snap = useSnapshot(pageState);
  const { data, isLoading } = useQuery({
    queryKey: ['analyticsData', snap],
    queryFn: () =>
      getAnalyticsPublicCloudData({
        dates: snap.dates,
        userId: snap.userId,
        ministries: snap.ministries,
        providers: snap.providers,
      }),
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        {isLoading ? (
          <Loader color="pink" type="bars" />
        ) : (
          <span className="text-red-500 text-lg">Failed to load analytics data. Please try again.</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 py-6">
        Public Cloud Data Analytics
      </h1>
      <FilterPanel />
      <div className="grid grid-cols-1 gap-8 mt-12">
        <AllRequests data={data.allRequests} />
        <ContactChangeRequests data={data.contactsChange} />
        <ActiveProducts data={data.activeProducts} />
        <RequestsDecisionTime data={data.requestDecisionTime} />
        <MinistryDistribution data={data.ministryDistributionData} />
      </div>
    </div>
  );
});
