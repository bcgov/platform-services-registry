'use client';

import { LoadingOverlay } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Title } from '@tremor/react';
import { useSnapshot } from 'valtio';
import ExportButton from '@/components/buttons/ExportButton';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  downloadPrivateCloudUsersWithQuotaEditRequests,
  getAnalyticsPrivateCloudData,
} from '@/services/backend/analytics/private-cloud';
import ActiveProducts from './activeProducts';
import AllRequests from './allRequests';
import ContactChangeRequests from './contactChangeRequests';
import FilterPanel from './filterPanel';
import MinistryDistribution from './ministryDistribution';
import QuotaRequests from './quotaRequests';
import RequestsDecisionTime from './requestsDecisionTime';
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
          <LoadingOverlay
            visible
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
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
      <FilterPanel snap={snap} />
      <div className="grid grid-cols-1 gap-8 mt-12">
        <AllRequests snap={snap} data={data} />
        <QuotaRequests snap={snap} data={data} />
        <ContactChangeRequests snap={snap} data={data} />
        <ActiveProducts snap={snap} data={data} />
        <RequestsDecisionTime snap={snap} data={data} />
        <MinistryDistribution snap={snap} data={data} />
      </div>
      <div className="flex flex-col items-start border rounded-lg w-fit p-4 mt-8">
        <Title>{'Users with quota edit requests'}</Title>
        <ExportButton
          onExport={async () => {
            const exportParams = {
              data: { ...snap },
            };
            return await downloadPrivateCloudUsersWithQuotaEditRequests(exportParams);
          }}
          className="m-2"
        />
      </div>
    </div>
  );
});
