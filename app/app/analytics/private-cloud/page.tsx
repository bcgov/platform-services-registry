'use client';

import { Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import ExportButton from '@/components/buttons/ExportButton';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  downloadPrivateCloudUsersWithQuotaEditRequests,
  getAnalyticsPrivateCloudData,
} from '@/services/backend/analytics/private-cloud';
import ActiveProducts from './ActiveProducts';
import AllRequests from './AllRequests';
import ContactChangeRequests from './ContactChangeRequests';
import FilterPanel from './FilterPanel';
import MinistryDistribution from './MinistryDistribution';
import QuotaRequests from './QuotaRequests';
import RequestsDecisionTime from './RequestsDecisionTime';
import { pageState } from './state';

const analyticsPrivateCloudDashboard = createClientPage({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default analyticsPrivateCloudDashboard(() => {
  const snap = useSnapshot(pageState);
  const { data, isLoading } = useQuery({
    queryKey: ['analyticsData', snap],
    queryFn: () =>
      getAnalyticsPrivateCloudData({
        dates: snap.dates,
        userId: snap.userId,
        ministries: snap.ministries,
        clusters: snap.clusters,
        temporary: snap.temporary,
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
        Private Cloud Data Analytics
      </h1>
      <FilterPanel />
      <div className="grid grid-cols-1 gap-8 mt-12">
        <AllRequests data={data.allRequests} />
        <QuotaRequests data={data.quotaChange} />
        <ContactChangeRequests data={data.contactsChange} />
        <ActiveProducts data={data.activeProducts} />
        <RequestsDecisionTime data={data.requestDecisionTime} />
        <MinistryDistribution data={data.ministryDistributionData} />
      </div>
      <div className="flex flex-col items-start border rounded-lg w-fit p-4 mt-8">
        <h3>Users with quota edit requests</h3>
        <ExportButton
          onExport={async () => downloadPrivateCloudUsersWithQuotaEditRequests({ data: { ...snap } })}
          className="m-2"
        />
      </div>
    </div>
  );
});
